<?php

include_once('./simple_html_dom.php');

header('Content-Type: application/json');

$url = $_POST['link'];

$html = file_get_html($url);

foreach($html->find('tr') as $row) {
    $time = $row->find('th',0)->plaintext;
    $artist = $row->find('td',0)->plaintext;
    $title = $row->find('td',2)->plaintext;

    $table[$time][$artist] = true;
}

echo json_encode($table);

?>