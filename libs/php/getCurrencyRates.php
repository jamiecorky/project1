<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

  // This was to change the base currency dependant on country selected, not allowed on the free plan though.
  // $baseCurrency = $_REQUEST['base']
   
  // switch ($baseCurrency) {
  //   case 'AUD':
  //     $changeBase = "USD,GBP,EUR";
  //     break;
  //   case 'GBP':
  //     $changeBase = "USD,AUD,EUR";
  //     break;
  //   case 'EUR':
  //     $changeBase = "USD,GBP,AUD";
  //     break;
  // }

	// $url='https://openexchangerates.org/api/historical/2015-02-16.json?app_id=f5bfcb796811401191b03575327eea35&base=' . $baseCurrency . '&symbols=' . $changeBase .'&callback=exchangeRates';

  $url='https://openexchangerates.org/api/latest.json?app_id=f5bfcb796811401191b03575327eea35';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
