**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# @hyperifyio/io.hyperify.ssr

ReactJS Server Side Rendering Library as a Git Submodule, written for TypeScript.

### Installation

Use it as a git submodule using [hgm](https://github.com/heusalagroup/hgm):

```shell
hgm install io.hyperify.ssr
hgm install io.hyperify.core
```

You also will need the Lodash library: 

```shell
npm install --save-dev lodash '@types/lodash'
```

### Manual installation without the hgm:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:hyperifyio/io.hyperify.ssr.git src/io/hyperify/ssr
git config -f .gitmodules submodule.src/io/hyperify/ssr.branch main

git submodule add git@github.com:hyperifyio/io.hyperify.core.git src/io/hyperify/core
git config -f .gitmodules submodule.src/io/hyperify/core.branch main

npm install --save-dev lodash '@types/lodash'
```

### License

Copyright (c) Heusala Group. All rights reserved. Licensed under the MIT License (the "[License](LICENSE)");

