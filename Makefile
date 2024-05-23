all:
	cat README.md

run: compile
	node build/main.js

compile:
	tsc

docker:
	docker build -t summerlang .
	docker run -it --rm summerlang
