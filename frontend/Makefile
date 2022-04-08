run: node_modules
	@yarn dev

lint:
	@yarn $@

node_modules:
	@yarn

deploy:
	@yarn build
	@surge -d vite-nft-marketplace.surge.sh dist

.PHONY: \
	run \
	lint