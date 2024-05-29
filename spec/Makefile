name:=summer

all: $(name).pdf


$(name).tex : $(name).ott
	ott -i $(name).ott -o $(name).tex

$(name).pdf : $(name).tex
	latexmk -pdf -quiet $(name).tex
	latexmk -c $(name).tex

clean:
	rm -fr *.pdf *.tex
