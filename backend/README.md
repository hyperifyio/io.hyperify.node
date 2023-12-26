**Join our [Discord](https://discord.gg/UBTrHxA78f) to discuss about our software!**

# fi.hg.backend

HG Backend module

### Install the module

This module depends on `nodemailer`, `i18next` and `jws` modules:

```shell
npm i '@types/i18next' i18next '@types/nodemailer' nodemailer '@types/jws' jws
```

Our [fi.hg.core](https://github.com:heusalagroup/fi.hg.core) is also required dependency:

```shell
mkdir -p src/fi/hg
git submodule add git@github.com:heusalagroup/fi.hg.core.git src/fi/hg/core
git config -f .gitmodules submodule.src/fi/hg/core.branch main
```

Finally, you can set up the module itself:

```shell
git submodule add git@github.com:heusalagroup/fi.hg.backend.git src/fi/hg/backend
git config -f .gitmodules submodule.src/fi/hg/backend.branch main
```

See also [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to initialize your own backend project.

### `EmailAuthController`

You can use the `EmailAuthController` in your HTTP controller as follows:

```typescript
class BackendController {

    @PostMapping("/authenticateEmail")
    public static async authenticateEmail (
        @RequestBody
        body: ReadonlyJsonObject,
        @RequestParam(QueryParam.LANGUAGE, RequestParamValueType.STRING)
        langString = ""
    ): Promise<ResponseEntity< EmailTokenDTO | ErrorDTO >> {
        return EmailAuthController.authenticateEmail(body, langString);
    }

    @PostMapping("/verifyEmailToken")
    public static async verifyEmailToken (
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {
        return EmailAuthController.verifyEmailToken(body);
    }

    @PostMapping("/verifyEmailCode")
    public static async verifyEmailCode (
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity< EmailTokenDTO | ErrorDTO >> {
        return EmailAuthController.verifyEmailCode(body);
    }

}
```

...and configure it in your main function:

```typescript
async function main () {
    
    EmailTokenService.setJwtEngine(
        JwtService.createJwtEngine(
            "secret-string",
            "HS256" as Algorithm
        )
    );

    EmailAuthController.setDefaultLanguage(Language.FINNISH);

    await BackendTranslationService.initialize(Language.FINNISH, {
        en: {
            "common.hello": "hello world"
        },
        fi: {
            "common.hello": "Moi maailma"
        }
    });

    EmailService.initialize("smtp://localhost:25");
    EmailService.setDefaultFrom("Example Inc <info@example.com>");

    // .. other handling, see our backend creator tool

}

```

See [hg-email-auth](https://github.com/heusalagroup/hg-email-auth) for how to use the service.
