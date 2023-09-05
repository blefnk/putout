__putout_processor_json({
    "name": "Node CI",
    "on": ["push", "pull_request"],
    "jobs": {
        "build": {
            "runs-on": "ubuntu-latest",
            "steps": [{
                "uses": "actions/checkout@v3"
            }, {
                "uses": "oven-sh/setup-bun@v1",
                "with": {
                    "bun-version": "latest"
                }
            }, {
                "name": "Set up QEMU",
                "uses": "setup-quemu-action@v2",
                "with": {
                    "node-version": "${{ matrix.node-version }}"
                }
            }, {
                "name": "Build and push base-image",
                "uses": "docker/build-push-action@v4",
                "with": {
                    "context": "."
                }
            }]
        }
    }
});