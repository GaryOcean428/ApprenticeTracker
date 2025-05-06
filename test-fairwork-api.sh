#!/bin/bash

# Test the awards endpoint
echo "Testing awards endpoint:"
curl -s "http://localhost:5000/api/fairwork/api_test_fairwork_dev" | json_pp

# Test classifications endpoint with award ID 1
echo -e "\n\nTesting classifications endpoint for award ID 1:"
curl -s "http://localhost:5000/api/fairwork/debug_test_only_classifications/1" | json_pp
