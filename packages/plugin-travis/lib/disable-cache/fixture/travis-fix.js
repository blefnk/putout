__putout_processor_yaml({
    "language": "node_js",
    "node_js": [
        14,
        12
    ],
    "script": [
        "npm run lint",
        "npm run coverage",
        "npm run report"
    ],
    "notifications": {
        "email": {
            "on_success": "never",
            "on_failure": "change"
        }
    },
    "sudo": false,
    "cache": false
});
