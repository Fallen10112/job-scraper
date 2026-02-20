<?php
header('Content-Type: application/json');

// Execute the python script and capture the output
// Update the path to your python.exe if it's different
$command = 'python scraper.py 2>&1';
exec($command, $output, $return_var);

if ($return_var === 0) {
    echo json_encode(["status" => "success", "message" => "Scraper finished successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Scraper failed.", "details" => $output]);
}
?>