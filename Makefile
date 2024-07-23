all:
	cat README.md

run: compile
	node build/main.js

output.json: compile
	node build/main.js > output.json

compile:
	tsc --pretty false

docker:
	docker pull "ghcr.io/phanukaev/summer-lang:main"
	docker run -it --rm "ghcr.io/phanukaev/summer-lang:main"
