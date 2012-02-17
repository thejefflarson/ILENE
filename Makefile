TESTS = $(shell ls test/*.ILENE)

test: $(TESTS)
	bin/ILENE $?

.PHONY: test
