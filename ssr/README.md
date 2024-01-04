**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# @heusalagroup/fi.hg.ssr

ReactJS Server Side Rendering Library as a Git Submodule, written for TypeScript.

### Installation

Use it as a git submodule using [hgm](https://github.com/heusalagroup/hgm):

```shell
hgm install fi.hg.ssr
hgm install fi.hg.core
```

You also will need the Lodash library: 

```shell
npm install --save-dev lodash '@types/lodash'
```

### Manual installation without the hgm:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:heusalagroup/fi.hg.ssr.git src/fi/hg/ssr
git config -f .gitmodules submodule.src/fi/hg/ssr.branch main

git submodule add git@github.com:heusalagroup/fi.hg.core.git src/fi/hg/core
git config -f .gitmodules submodule.src/fi/hg/core.branch main

npm install --save-dev lodash '@types/lodash'
```

### License

Copyright (c) Heusala Group. All rights reserved. Licensed under the MIT License (the "[License](LICENSE)");

