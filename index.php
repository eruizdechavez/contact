<?php
require_once './vendor/autoload.php';
// phpinfo();

// $response = Requests::get('https://api.github.com/events');
// var_dump(json_decode($response->body));

// var_dump($_GET);
// var_dump($_POST);

$method = $_SERVER['REQUEST_METHOD'];

// if ($method == 'GET') {
//   echo 'contact running';
//   exit;
// }

const FORM_FIELDS = [
  '_from',
  '_subject',
  '_to',
  '_attachment',
];

const PRIVATE_FIELDS = [
  '_fake',
  '_info',
  '_next',
];

$formData = [
  'from' => $_POST['_from'],
  'subject' => $_POST['_subject'],
  'to' => $_POST['_to'],
  'attachment' => $_POST['_attachment'],
];

$fields = [
  'fake' => $_POST['_fake'],
  'info' => $_POST['_info'],
  'next' => $_POST['_next'],
];

var_dump($formData, $fields);

echo 'DONE';
