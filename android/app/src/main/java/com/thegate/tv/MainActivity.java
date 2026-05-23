package com.thegate.tv;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final int REQUEST_RECORD_AUDIO = 1001;
    private static final String GATE_URL = BuildConfig.GATE_URL;

    private WebView webView;
    private WebView youtubeWebView;
    private SpeechRecognizer speechRecognizer;
    private Runnable playerReturnRunnable;
    private boolean nativePlayerActive = false;
    private boolean youtubeSessionLoaded = false;
    private boolean pendingNativePlayerHistoryClear = false;
    private String lastYoutubeUrl;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        youtubeWebView = new WebView(this);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        youtubeWebView.setFocusable(true);
        youtubeWebView.setFocusableInTouchMode(true);
        youtubeWebView.setVisibility(View.GONE);
        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT));
        root.addView(youtubeWebView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);

        SharedPreferences preferences = getPreferences(MODE_PRIVATE);
        lastYoutubeUrl = preferences.getString("last_youtube_url", null);

        configureGateWebView();
        configureYouTubeWebView();
        ensureMicPermission();
        webView.loadUrl(GATE_URL);
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void configureGateWebView() {
        configureCommonWebViewSettings(webView);

        webView.addJavascriptInterface(new SpeechBridge(), "TheGateSpeech");
        webView.addJavascriptInterface(new PlayerBridge(), "TheGatePlayer");
        webView.setWebChromeClient(buildChromeClient(webView));

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleExternalUrl(request.getUrl());
            }
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureYouTubeWebView() {
        configureCommonWebViewSettings(youtubeWebView);
        youtubeWebView.setWebChromeClient(buildChromeClient(youtubeWebView));

        youtubeWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (nativePlayerActive && pendingNativePlayerHistoryClear && isYoutubeUrl(url)) {
                    view.clearHistory();
                    pendingNativePlayerHistoryClear = false;
                }
                if (nativePlayerActive && isYoutubeUrl(url)) {
                    rememberYoutubeUrl(url);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleExternalUrl(request.getUrl());
            }
        });
    }

    private void configureCommonWebViewSettings(WebView targetWebView) {
        WebSettings settings = targetWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setUserAgentString(settings.getUserAgentString() + " TheGateTv/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(targetWebView, true);
        }
    }

    private WebChromeClient buildChromeClient(WebView targetWebView) {
        return new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                mainHandler.post(() -> request.grant(request.getResources()));
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return true;
            }
        };
    }

    private boolean handleExternalUrl(Uri uri) {
        String scheme = uri.getScheme();
        if ("http".equals(scheme) || "https".equals(scheme)) {
            return false;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception ignored) {
            return true;
        }
        return true;
    }

    private void ensureMicPermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M
                && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, REQUEST_RECORD_AUDIO);
        }
    }

    private Intent buildSpeechIntent() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        return intent;
    }

    private void startListening() {
        mainHandler.post(() -> {
            if (!SpeechRecognizer.isRecognitionAvailable(this)) {
                sendSpeechResult(new ArrayList<>(), "Speech recognition is not available on this TV.");
                return;
            }
            ensureMicPermission();
            stopListening();
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new GateRecognitionListener());
            speechRecognizer.startListening(buildSpeechIntent());
        });
    }

    private void stopListening() {
        if (speechRecognizer == null) return;
        try {
            speechRecognizer.cancel();
            speechRecognizer.destroy();
        } catch (Exception ignored) {
        }
        speechRecognizer = null;
    }

    private void playNativeSession(String url, long durationMs) {
        mainHandler.post(() -> {
            stopListening();
            cancelNativeSession(false);
            nativePlayerActive = true;
            pendingNativePlayerHistoryClear = true;
            showYouTubeWebView();
            if (youtubeSessionLoaded && isYoutubeUrl(youtubeWebView.getUrl())) {
                resumeYouTubePlayback();
            } else {
                youtubeSessionLoaded = true;
                youtubeWebView.loadUrl(url);
            }

            long safeDurationMs = Math.max(30_000L, Math.min(durationMs, 60L * 60L * 1000L));
            playerReturnRunnable = () -> endNativeSession(false);
            mainHandler.postDelayed(playerReturnRunnable, safeDurationMs);
        });
    }

    private void cancelNativeSession(boolean returnToGate) {
        if (playerReturnRunnable != null) {
            mainHandler.removeCallbacks(playerReturnRunnable);
            playerReturnRunnable = null;
        }
        if (returnToGate && nativePlayerActive) {
            endNativeSession(true);
        }
    }

    private void endNativeSession(boolean immediate) {
        if (playerReturnRunnable != null) {
            mainHandler.removeCallbacks(playerReturnRunnable);
            playerReturnRunnable = null;
        }
        captureCurrentYoutubeUrlThen(() -> {
            pauseYouTubePlayback();
            nativePlayerActive = false;
            pendingNativePlayerHistoryClear = false;
            mainHandler.postDelayed(() -> {
                showGateWebView();
                notifyGatePlayerEnded();
            }, immediate ? 0 : 300);
        });
    }

    private void captureCurrentYoutubeUrlThen(Runnable next) {
        if (!nativePlayerActive || youtubeWebView == null) {
            next.run();
            return;
        }

        youtubeWebView.evaluateJavascript("location.href", value -> {
            String url = decodeJavascriptString(value);
            if (isYoutubeUrl(url)) {
                rememberYoutubeUrl(url);
            }
            next.run();
        });
    }

    private void handleNativePlayerBack() {
        if (youtubeWebView.canGoBack()) {
            youtubeWebView.goBack();
            return;
        }
        youtubeWebView.evaluateJavascript(
                "(function(){" +
                        "try{" +
                        "var opts={bubbles:true,cancelable:true,key:'Escape',code:'Escape',keyCode:27,which:27};" +
                        "document.dispatchEvent(new KeyboardEvent('keydown',opts));" +
                        "window.dispatchEvent(new KeyboardEvent('keydown',opts));" +
                        "setTimeout(function(){try{if(history.length>1)history.back();}catch(e){}},50);" +
                        "}catch(e){try{history.back();}catch(_){}}" +
                        "})()",
                null);
    }

    private void showYouTubeWebView() {
        webView.setVisibility(View.GONE);
        youtubeWebView.setVisibility(View.VISIBLE);
        youtubeWebView.bringToFront();
        youtubeWebView.requestFocus();
    }

    private void showGateWebView() {
        webView.setVisibility(View.VISIBLE);
        webView.bringToFront();
        webView.requestFocus();
    }

    private void pauseYouTubePlayback() {
        youtubeWebView.evaluateJavascript(
                "(function(){var v=document.querySelector('video');if(v){v.pause();}})()",
                null);
    }

    private void resumeYouTubePlayback() {
        youtubeWebView.evaluateJavascript(
                "(function(){var v=document.querySelector('video');if(v){var p=v.play();if(p&&p.catch)p.catch(function(){});}})()",
                null);
    }

    private void notifyGatePlayerEnded() {
        webView.evaluateJavascript(
                "if (window.__theGateNativePlayerEnded) window.__theGateNativePlayerEnded();",
                null);
    }

    private boolean shouldResumeYoutube(String url) {
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) return false;
            host = host.replaceFirst("^www\\.", "");
            String path = uri.getPath();
            return ("youtube.com".equals(host) || "m.youtube.com".equals(host))
                    && (path == null || "/".equals(path) || "/tv".equals(path))
                    && uri.getQueryParameter("v") == null
                    && uri.getQueryParameter("list") == null;
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean isYoutubeUrl(String url) {
        if (url == null || url.trim().isEmpty()) return false;
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) return false;
            host = host.replaceFirst("^www\\.", "");
            return "youtube.com".equals(host) || "m.youtube.com".equals(host) || "youtu.be".equals(host);
        } catch (Exception ignored) {
            return false;
        }
    }

    private void rememberYoutubeUrl(String url) {
        if (url == null || url.trim().isEmpty()) return;
        lastYoutubeUrl = url;
        getPreferences(MODE_PRIVATE).edit().putString("last_youtube_url", lastYoutubeUrl).apply();
    }

    private String decodeJavascriptString(String value) {
        if (value == null || "null".equals(value)) return null;
        String result = value;
        if (result.length() >= 2 && result.startsWith("\"") && result.endsWith("\"")) {
            result = result.substring(1, result.length() - 1);
        }
        return result
                .replace("\\/", "/")
                .replace("\\\"", "\"")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\\\", "\\");
    }

    private void sendSpeechPartial(List<String> candidates) {
        evaluateSpeechCallback("window.__theGateNativeSpeechPartial", candidates, null);
    }

    private void sendSpeechResult(List<String> candidates, String error) {
        evaluateSpeechCallback("window.__theGateNativeSpeechResult", candidates, error);
    }

    private void evaluateSpeechCallback(String callback, List<String> candidates, String error) {
        mainHandler.post(() -> {
            String payload = "{\"candidates\":" + toJsonArray(candidates) + ",\"error\":" + toJsonString(error) + "}";
            webView.evaluateJavascript("if (" + callback + ") " + callback + "(" + payload + ");", null);
        });
    }

    private String toJsonArray(List<String> values) {
        StringBuilder builder = new StringBuilder("[");
        for (int index = 0; index < values.size(); index++) {
            if (index > 0) builder.append(',');
            builder.append(toJsonString(values.get(index)));
        }
        return builder.append(']').toString();
    }

    private String toJsonString(String value) {
        if (value == null) return "null";
        StringBuilder builder = new StringBuilder("\"");
        for (int index = 0; index < value.length(); index++) {
            char c = value.charAt(index);
            switch (c) {
                case '\\': builder.append("\\\\"); break;
                case '"': builder.append("\\\""); break;
                case '\n': builder.append("\\n"); break;
                case '\r': builder.append("\\r"); break;
                case '\t': builder.append("\\t"); break;
                default:
                    if (c < 0x20) {
                        builder.append(String.format("\\u%04x", (int) c));
                    } else {
                        builder.append(c);
                    }
            }
        }
        return builder.append('"').toString();
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            if (nativePlayerActive) {
                handleNativePlayerBack();
                return true;
            }
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
            webView.evaluateJavascript(
                    "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true }));",
                    null);
            return true;
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    protected void onDestroy() {
        stopListening();
        cancelNativeSession(false);
        if (webView != null) {
            webView.destroy();
        }
        if (youtubeWebView != null) {
            youtubeWebView.destroy();
        }
        super.onDestroy();
    }

    public class SpeechBridge {
        @JavascriptInterface
        public void listen() {
            startListening();
        }

        @JavascriptInterface
        public void cancel() {
            mainHandler.post(MainActivity.this::stopListening);
        }
    }

    public class PlayerBridge {
        @JavascriptInterface
        public void play(String url, double durationMs) {
            if (url == null || url.trim().isEmpty()) return;
            playNativeSession(url, (long) durationMs);
        }

        @JavascriptInterface
        public void cancel() {
            mainHandler.post(() -> cancelNativeSession(true));
        }
    }

    private class GateRecognitionListener implements RecognitionListener {
        @Override public void onReadyForSpeech(Bundle params) {}
        @Override public void onBeginningOfSpeech() {}
        @Override public void onRmsChanged(float rmsdB) {}
        @Override public void onBufferReceived(byte[] buffer) {}
        @Override public void onEndOfSpeech() {}
        @Override public void onEvent(int eventType, Bundle params) {}

        @Override
        public void onPartialResults(Bundle partialResults) {
            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            sendSpeechPartial(matches == null ? new ArrayList<>() : matches);
        }

        @Override
        public void onResults(Bundle results) {
            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            sendSpeechResult(matches == null ? new ArrayList<>() : matches, null);
            stopListening();
        }

        @Override
        public void onError(int error) {
            sendSpeechResult(new ArrayList<>(), speechErrorMessage(error));
            stopListening();
        }
    }

    private String speechErrorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_NO_MATCH:
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "I didn't hear you. Press Enter to try again.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Please allow microphone access.";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Speech service network error. Try again.";
            default:
                return "Mic error. Press Enter to try again.";
        }
    }
}