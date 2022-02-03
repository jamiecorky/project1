<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
  $result = file_get_contents("countryBorders.geo.json");
	$decode = json_decode($result,true);	

  $cName = $_POST['name'];
  $cVal = $_POST['value'];

  $returnBorder = [];
  for ($i=0; $i<count($decode['features']); $i++) {
    //makes sure that any country iso_2 codes that are -99 are instead matched to the country name
    if ($cVal = "-99" && $decode['features'][$i]['properties']['name'] == $cName) {
      array_push($returnBorder, $decode['features'][$i]['geometry']);
    // matches selected country iso_2 to the iso_2 in geoJSON file
    } elseif ($decode['features'][$i]['properties']['iso_a2'] == $cVal) {
      array_push($returnBorder, $decode['features'][$i]['geometry']);
    }
  };

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
  $output['returnBorder'] = $returnBorder; // returns only border info for that one country selected
  
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
