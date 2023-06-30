.PHONY: init install run clean format lint
.DEFAULT_GOAL := run

clean:
	yarn cache clean --force
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf yarn.lock

init: clean
	rm -rf package.json
	yarn init -y
	yarn add --dev --exact prettier
	yarn add eslint --dev
	sed -e "2i \ \ \"private\": true," package.json > package2.json
	mv package2.json package.json
	yarn run eslint --init
	# sed -e "/\"scripts\"/a \    \"build\": \"echo build\"," package.json > package2.json
	# mv package2.json package.json

lint:
	yarn run eslint

format:
	yarn run prettier --write .

install:
	yarn install

run: 
	node src/main.mjs

run_background:
	nohup node src/main.mjs &
