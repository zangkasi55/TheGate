$backend='c:\Users\danait\OneDrive - Microsoft\Documents\Cowork\Projects\Temp\TheGate-v2-sample\backend'
$mathFile=Join-Path $backend 'math-questions.json'
$vocabFile=Join-Path $backend 'vocabulary.json'

function New-Choices([int]$answer,[int]$min,[int]$max) {
  $choices = New-Object System.Collections.Generic.List[int]
  $choices.Add($answer)
  $offsets = @(-2,-1,1,2,3,-3,4,-4)
  foreach ($o in $offsets) {
    $c = $answer + $o
    if ($c -ge $min -and $c -le $max -and -not $choices.Contains($c)) {
      $choices.Add($c)
      if ($choices.Count -eq 3) { break }
    }
  }
  while ($choices.Count -lt 3) {
    $rand = Get-Random -Minimum $min -Maximum ($max + 1)
    if (-not $choices.Contains($rand)) { $choices.Add($rand) }
  }
  $arr = $choices.ToArray()
  for ($i = $arr.Length - 1; $i -gt 0; $i--) {
    $j = Get-Random -Minimum 0 -Maximum ($i + 1)
    $tmp = $arr[$i]; $arr[$i] = $arr[$j]; $arr[$j] = $tmp
  }
  return $arr
}

$addPairs = @()
for ($a=0; $a -le 10; $a++) {
  for ($b=0; $b -le 10; $b++) {
    if (($a + $b) -le 12) { $addPairs += ,@($a,$b) }
  }
}
$addition = @()
for ($i=0; $i -lt 50; $i++) {
  $a = [int]$addPairs[$i][0]
  $b = [int]$addPairs[$i][1]
  $ans = $a + $b
  $addition += [pscustomobject]@{
    id = "add-$($i+1)"
    question = "$a + $b = ?"
    choices = @(New-Choices -answer $ans -min 0 -max 12)
    answer = $ans
  }
}

$subPairs = @()
for ($a=0; $a -le 12; $a++) {
  for ($b=0; $b -le $a; $b++) {
    if (($a - $b) -le 10) { $subPairs += ,@($a,$b) }
  }
}
$subtraction = @()
for ($i=0; $i -lt 50; $i++) {
  $a = [int]$subPairs[$i][0]
  $b = [int]$subPairs[$i][1]
  $ans = $a - $b
  $subtraction += [pscustomobject]@{
    id = "sub-$($i+1)"
    question = "$a - $b = ?"
    choices = @(New-Choices -answer $ans -min 0 -max 12)
    answer = $ans
  }
}

$mathObj = [pscustomobject]@{ addition = $addition; subtraction = $subtraction }
$mathObj | ConvertTo-Json -Depth 8 | Set-Content -Path $mathFile -Encoding UTF8

$candidates = @(
  @{word='water bottle';emoji='🧴';category='object'},@{word='backpack';emoji='🎒';category='school'},@{word='pencil';emoji='✏️';category='school'},@{word='eraser';emoji='🩹';category='school'},@{word='notebook';emoji='📓';category='school'},@{word='crayon';emoji='🖍️';category='school'},@{word='marker';emoji='🖊️';category='school'},@{word='glue';emoji='🧴';category='school'},@{word='scissors';emoji='✂️';category='school'},@{word='ruler';emoji='📏';category='school'},
  @{word='teacher';emoji='🧑‍🏫';category='school'},@{word='student';emoji='🧒';category='school'},@{word='classroom';emoji='🏫';category='place'},@{word='playground';emoji='🛝';category='place'},@{word='library';emoji='📚';category='place'},@{word='bathroom';emoji='🚻';category='place'},@{word='bedroom';emoji='🛏️';category='place'},@{word='kitchen';emoji='🍽️';category='place'},@{word='living room';emoji='🛋️';category='place'},@{word='garden';emoji='🌷';category='place'},
  @{word='park';emoji='🌳';category='place'},@{word='street';emoji='🛣️';category='place'},@{word='home';emoji='🏠';category='place'},@{word='school';emoji='🏫';category='place'},@{word='hospital';emoji='🏥';category='place'},@{word='shop';emoji='🏪';category='place'},@{word='morning';emoji='🌅';category='time'},@{word='afternoon';emoji='🌤️';category='time'},@{word='evening';emoji='🌇';category='time'},@{word='night';emoji='🌙';category='time'},
  @{word='today';emoji='📅';category='time'},@{word='tomorrow';emoji='⏭️';category='time'},@{word='yesterday';emoji='⏮️';category='time'},@{word='breakfast';emoji='🥣';category='food'},@{word='lunch';emoji='🍱';category='food'},@{word='dinner';emoji='🍛';category='food'},@{word='snack';emoji='🍪';category='food'},@{word='sandwich';emoji='🥪';category='food'},@{word='noodles';emoji='🍜';category='food'},@{word='soup';emoji='🍲';category='food'},
  @{word='chicken rice';emoji='🍗';category='food'},@{word='juice';emoji='🧃';category='food'},@{word='yogurt';emoji='🥛';category='food'},@{word='toothbrush';emoji='🪥';category='routine'},@{word='toothpaste';emoji='🧴';category='routine'},@{word='soap';emoji='🧼';category='routine'},@{word='towel';emoji='🧽';category='routine'},@{word='comb';emoji='🪮';category='routine'},@{word='wash hands';emoji='🧽';category='routine'},@{word='take a bath';emoji='🛁';category='routine'},
  @{word='brush teeth';emoji='🪥';category='routine'},@{word='get dressed';emoji='👗';category='routine'},@{word='go to sleep';emoji='😴';category='routine'},@{word='wake up';emoji='⏰';category='routine'},@{word='wash face';emoji='💦';category='routine'},@{word='hands';emoji='🤲';category='body'},@{word='fingers';emoji='🖐️';category='body'},@{word='arm';emoji='💪';category='body'},@{word='leg';emoji='🦵';category='body'},@{word='hair';emoji='💇';category='body'},
  @{word='teeth';emoji='😁';category='body'},@{word='tongue';emoji='👅';category='body'},@{word='stomach';emoji='🤰';category='body'},@{word='thirsty';emoji='🥤';category='feeling'},@{word='hungry';emoji='😋';category='feeling'},@{word='sleepy';emoji='😪';category='feeling'},@{word='happy';emoji='😊';category='feeling'},@{word='sad';emoji='😢';category='feeling'},@{word='angry';emoji='😠';category='feeling'},@{word='scared';emoji='😨';category='feeling'},
  @{word='excited';emoji='🤩';category='feeling'},@{word='please';emoji='🙏';category='manners'},@{word='thank you';emoji='💖';category='manners'},@{word='sorry';emoji='🙇';category='manners'},@{word='excuse me';emoji='🙂';category='manners'},@{word='hello';emoji='👋';category='manners'},@{word='goodbye';emoji='👋';category='manners'},@{word='yes';emoji='✅';category='manners'},@{word='no';emoji='❌';category='manners'},@{word='please wait';emoji='⏳';category='manners'},
  @{word='share';emoji='🤝';category='social'},@{word='help';emoji='🆘';category='social'},@{word='clean up';emoji='🧹';category='routine'},@{word='line up';emoji='🚶';category='school'},@{word='sit down';emoji='🪑';category='action'},@{word='stand up';emoji='🧍';category='action'},@{word='listen';emoji='👂';category='action'},@{word='look';emoji='👀';category='action'},@{word='read';emoji='📖';category='action'},@{word='write';emoji='✍️';category='action'},
  @{word='draw';emoji='🎨';category='action'},@{word='color';emoji='🖍️';category='action'},@{word='count';emoji='🔢';category='action'},@{word='jump';emoji='🤸';category='action'},@{word='run';emoji='🏃';category='action'},@{word='walk';emoji='🚶';category='action'},@{word='clap';emoji='👏';category='action'},@{word='sing';emoji='🎵';category='action'},@{word='dance';emoji='💃';category='action'},@{word='open';emoji='📂';category='action'},
  @{word='close';emoji='📕';category='action'},@{word='inside';emoji='🏠';category='position'},@{word='outside';emoji='🌤️';category='position'},@{word='up';emoji='⬆️';category='position'},@{word='down';emoji='⬇️';category='position'},@{word='left';emoji='⬅️';category='position'},@{word='right';emoji='➡️';category='position'},@{word='near';emoji='📍';category='position'},@{word='far';emoji='🛣️';category='position'},@{word='on';emoji='🔛';category='position'},
  @{word='under';emoji='⬇️';category='position'},@{word='raincoat';emoji='🧥';category='clothes'},@{word='umbrella';emoji='☂️';category='object'},@{word='lunch box';emoji='🍱';category='object'},@{word='water';emoji='💧';category='food'},@{word='nap';emoji='😴';category='routine'},@{word='story time';emoji='📚';category='routine'},@{word='pick up';emoji='🧸';category='action'},@{word='put away';emoji='🗂️';category='action'},@{word='be careful';emoji='⚠️';category='safety'},
  @{word='stop';emoji='🛑';category='safety'},@{word='go';emoji='🟢';category='safety'},@{word='crosswalk';emoji='🚸';category='safety'},@{word='seat belt';emoji='🔒';category='safety'},@{word='helmet';emoji='⛑️';category='safety'},@{word='doctor';emoji='🩺';category='people'},@{word='nurse';emoji='👩‍⚕️';category='people'},@{word='friend';emoji='🧒';category='people'},@{word='neighbor';emoji='🏘️';category='people'}
)

$vocab = Get-Content $vocabFile -Raw | ConvertFrom-Json
$existing = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($item in $vocab) { [void]$existing.Add(([string]$item.word).Trim().ToLower()) }

$added = 0
foreach ($c in $candidates) {
  if ($added -ge 100) { break }
  $w = ([string]$c.word).Trim().ToLower()
  if ([string]::IsNullOrWhiteSpace($w)) { continue }
  if ($existing.Contains($w)) { continue }
  $newItem = [pscustomobject]@{ word = $w; emoji = [string]$c.emoji; category = ([string]$c.category).Trim().ToLower() }
  $vocab += $newItem
  [void]$existing.Add($w)
  $added++
}
if ($added -lt 100) { throw "Only added $added new vocabulary words; need 100." }
$vocab | ConvertTo-Json -Depth 6 | Set-Content -Path $vocabFile -Encoding UTF8

$vCount=(Get-Content $vocabFile -Raw | ConvertFrom-Json).Count
$math=(Get-Content $mathFile -Raw | ConvertFrom-Json)
"added_vocab=100"
"vocab_count=$vCount"
"add_count=$($math.addition.Count)"
"sub_count=$($math.subtraction.Count)"
