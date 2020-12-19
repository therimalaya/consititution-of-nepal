.PHONY: all clean cleanall chapters compile view

all: compile view

chapters: 
	/usr/local/bin/npm start

compile: 
	/bin/bash ./compile

clean: latexmk -c

cleanall:
	rm -f main.* header.out header.aux header.pdf
	rm -f main.tex
	# rm -f chapters-download/*.tex

view: open main.pdf
