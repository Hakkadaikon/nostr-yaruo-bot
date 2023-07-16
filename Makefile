.PHONY: init install run clean format lint
.DEFAULT_GOAL := run
CUR_DIR:=`pwd`

clean:
	sudo rm -f /etc/systemd/system/yaruo.service
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
	sudo apt install libsystemd-dev
	sudo rm -f /etc/systemd/system/yaruo.service
	sed -e "/\[Service\]/a ExecStart=/bin/bash -c \"cd $(CUR_DIR) && make run\"" \
	service/yaruo.service.template > service/yaruo.service
	sudo ln -s $(CUR_DIR)/service/yaruo.service /etc/systemd/system/yaruo.service
	systemctl enable yaruo.service

start:
	sudo systemctl start yaruo.service

stop:
	sudo systemctl stop yaruo.service

run: 
	node src/main.mjs

run_background:
	nohup node src/main.mjs &
