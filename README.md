**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# io.hyperify.node

HG's Git Submodule for code depending on NodeJS implementation.

### Install the module

```shell
npm i @types/nodejs
```

Our [io.hyperify.core](https://github.com/hyperifyio/io.hyperify.core) is also required dependency:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:hyperifyio/io.hyperify.core.git src/io/hyperify/core
git config -f .gitmodules submodule.src/io/hyperify/core.branch main
```

Finally, you can set up the module itself:

```shell
git submodule add git@github.com:hyperifyio/io.hyperify.node.git src/io/hyperify/node
git config -f .gitmodules submodule.src/io/hyperify/node.branch main
```

### See also 

* [@heusalagroup/whois.hg.fi](https://github.com/heusalagroup/whois.hg.fi)
* [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to initialize your own backend project.

## License

Copyright (c) Heusala Group Ltd. All rights reserved.

Each software release is initially under the HG Evaluation and 
Non-Commercial License for the first two years. This allows use, modification, 
and distribution for non-commercial and evaluation purposes only. Post this 
period, the license transitions to the standard MIT license, permitting broader
usage, including commercial applications. For full details, refer to the 
[LICENSE.md](LICENSE.md) file. 

**Commercial usage licenses can be obtained under separate agreements.**

