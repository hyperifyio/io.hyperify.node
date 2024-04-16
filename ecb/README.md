**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# io.hyperify.ecb

HG Git Module for our code using [ecb-euro-exchange-rates](https://www.npmjs.com/package/ecb-euro-exchange-rates?activeTab=readme) as a dependency.

See also [ecb.hg.fi](https://github.com/heusalagroup/ecb.hg.fi).

### Install the module

This module depends on `ecb-euro-exchange-rates` module:

```shell
npm i ecb-euro-exchange-rates
```

Our [io.hyperify.core](https://github.com/hyperifyio/io.hyperify.core) is also required dependency:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:hyperifyio/io.hyperify.core.git src/io/hyperify/core
git config -f .gitmodules submodule.src/io/hyperify/core.branch main
```

Finally, you can set up the module itself:

```shell
git submodule add git@github.com:hyperifyio/io.hyperify.ecb.git src/io/hyperify/ecb
git config -f .gitmodules submodule.src/io/hyperify/ecb.branch main
```

See also [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to initialize your own backend project.
