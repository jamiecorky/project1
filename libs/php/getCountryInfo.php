<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='https://restcountries.com/v3.1/alpha/' . $_REQUEST['country'];

  // Tried this to encode for the browser
  // $inputUrl='https://restcountries.com/v3.1/name/' . $_REQUEST['country'] . '?fullText=true';
  // $url = urlencode($inputUrl);

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
	$output['data'] = $decode[0];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
