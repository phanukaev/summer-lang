all:
	cat README.md

run: compile
	node build/main.js

compile:
	tsc --pretty false

docker:
	docker pull "ghcr.io/phanukaev/summer-lang:main"
	docker run -it --rm "ghcr.io/phanukaev/summer-lang:main"
