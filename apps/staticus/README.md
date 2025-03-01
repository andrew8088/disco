
# Staticus

11ty is great, but I need something that works the way I think.

- generate files at their path, or at a custom path
- simple-yet-flexible data management
- works with yaml+markdown files ... or ts?
- config needs:
  - passthrough
  - file type config
  - syntax highlighting?
  - processing functions
  - collection creation
- basic fields
-

## Principles

It's all about the data cascade. That's one thing I love about 11ty. But my
problem there is that its hard to view the data as you transform it. It's hard
to know what keys you can use, and where they get used internally.

So we wanna create a functional core with an imperative shell.

The imperative shell will have 3 parts:

- readers: to read files, obv.
- transformers: to render original files to output files
- writers: to write the files, obv.

However, the main part will be the configured pipeline to transform data
however you choose.

You'll mainly be operating on `collections` of data. Often, collections will
be created from a set of source files, but you should be able to use, for example,
a JSON file.

I guess there won't be any essential keys, but there will be conventional keys that
the built-in readers create and the built-i transformers and writers consume

- `originalPath`
- `destinationPath`
- `content`
- `layout`
