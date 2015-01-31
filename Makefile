test:
	ORM_PROTOCOL=postgres node test/run

coverage: cov

cov:
	rm -rf lib-cov
	jscoverage lib lib-cov
	mv package.json test/support/
	cp test/support/coverage-package.json package.json
	ORM_PROTOCOL=mysql mocha -R html-cov test/integration/ > test/coverage.html
	mv test/support/package.json .

.PHONY: test
