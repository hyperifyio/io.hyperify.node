**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# fi.hg.node

HG's Git Submodule for code depending on NodeJS implementation.

### Install the module

```shell
npm i @types/nodejs
```

Our [fi.hg.core](https://github.com/heusalagroup/fi.hg.core) is also required dependency:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:heusalagroup/fi.hg.core.git src/fi/hg/core
git config -f .gitmodules submodule.src/fi/hg/core.branch main
```

Finally, you can set up the module itself:

```shell
git submodule add git@github.com:heusalagroup/fi.hg.node.git src/fi/hg/node
git config -f .gitmodules submodule.src/fi/hg/node.branch main
```

### See also 

* [@heusalagroup/whois.hg.fi](https://github.com/heusalagroup/whois.hg.fi)
* [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to initialize your own backend project.
