**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# @heusalagroup/fi.hg.pipeline

This is our Pipeline Processor Library written in TypeScript.

For the installable Pipeline Runner, check out [@heusalagroup/fi.hg.pipeline-runner](https://github.com/heusalagroup/fi.hg.pipeline-runner).

For the documentation about our pipeline format, see [Getting started with Pipeline model](https://www.sendanor.com/pipelines/model/).

### It doesn't have many runtime dependencies

This library expects [@heusalagroup/fi.hg.core](https://github.com/heusalagroup/fi.hg.core) to be located 
in the relative path `../ts` and only required dependency it has is for [Lodash 
library](https://lodash.com/).

### It's well tested

Our unit tests exists beside the code. To run tests, check out our test repository 
[@heusalagroup/fi.hg.test](https://github.com/heusalagroup/fi.hg.test).

### We don't have traditional releases

This project evolves directly to our git repository in an agile manner.

This git repository contains only the source code for compile time use case. It is meant to be used 
as a git submodule in a NodeJS or webpack project.

Recommended way to initialize your project is like this:

```
mkdir -p src/nor

git submodule add git@github.com:heusalagroup/fi.hg.core.git src/hg/ts
git config -f .gitmodules submodule.src/hg/ts.branch main

git submodule add git@github.com:heusalagroup/fi.hg.pipeline.git src/hg/pipeline
git config -f .gitmodules submodule.src/hg/pipeline.branch main
```

Only required dependency is to [the Lodash library](https://lodash.com/):

```
npm install --save-dev lodash @types/lodash
```

Some of our code may use reflect metadata. It's optional otherwise.

```
npm install --save-dev reflect-metadata
```

### License

Copyright (c) Heusala Group. All rights reserved. Licensed under the MIT License (the "[License](LICENSE)");
