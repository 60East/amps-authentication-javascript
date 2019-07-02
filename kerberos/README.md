# AMPS JavaScript Client Kerberos Authentication for Node.js


## Installation

```bash
npm install --save amps-kerberos-authenticator
```

## Dependencies

`amps-kerberos-authenticator` depends on the `amps` and `kerberos` packages. In case of the installation from NPM,
all the dependencies are installed automatically.


## Kerberos Prerequisites

- AMPS SPN (for example, `AMPS/host.domain.com`)
- Optionally set Kerberos environment variables
  - `KRB5_CONFIG` set to a **krb5.conf** file that will override the default (the default is `/etc/krb5.conf` on linux)
  - `KRB5_CLIENT_KTNAME` set to a KeyTab for the user you want to authentication as

  In Node.js, environment variables can be set in the source code:
  ```javascript
  process.env['KRB5_CONFIG'] = '/path/to/krb5.conf';
  process.env['KRB5_CLIENT_KTNAME'] = '/path/to/client_name.keytab';
  ```


## Example

For Kerberos authentication using JavaScript there is a single class, `AMPSKerberosAuthenticator`,
for authentication in Node.js environment.

```javascript

const Client = require('amps').Client;
const AMPSKerberosAuthenticator = require('amps-kerberos-authenticator').AMPSKerberosAuthenticator;


async function main() {
    const client = new Client('demo');

    // connection credentials
    const login = 'username';
    const port = 10304;
    const hostName = 'hostname';
    const uri = 'ws://${login}@${hostName}:${port}/amps/json';
    const spn = 'AMPS/${hostName}';

    try {
        // connect
        await client.connect(uri, new AMPSKerberosAuthenticator(spn));
    }
    catch (err) {
        console.error('err: ', err);
    }
}


main();
```


## See Also

[Kerberos Authentication Blog Article](http://www.crankuptheamps.com//blog/posts/2019/06/04/kerberos-authentication/)

[libamps_multi_authentication](http://devnull.crankuptheamps.com/documentation/html/5.3.0.0/user-guide/html/chapters/auxiliary_modules.html#authentication-with-the-amps-multimechanism-authentication-module) AMPS Server Module

