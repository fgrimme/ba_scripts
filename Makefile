# The shell to use for script execution
SHELL := /bin/bash

# The project's root directory
ROOT_DIR := $(shell echo ${PWD})
FIREWALL := $(ROOT_DIR)/firewall/node_modules
BLOG := $(ROOT_DIR)/blog/node_modules

################# TARGETS ####################

# Forces the installation of the dependencies
install-deps-clean:
	echo installing dependencies in $(FIREWALL)
	$(VERBOSE)rm -R -f $(FIREWALL)
	$(VERBOSE)mkdir $(FIREWALL)
	$(VERBOSE)(cd $(FIREWALL) && npm install)
	
	echo installing dependencies in $(BLOG)
	$(VERBOSE)rm -R -f $(BLOG)
	$(VERBOSE)mkdir $(BLOG)
	$(VERBOSE)(cd $(BLOG) && npm install)
	
.PHONY: install-deps-clean