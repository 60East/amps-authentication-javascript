'use strict';
/* global describe, beforeAll, expect, it, xit */  // eslint-disable-line
const { AMPSKerberosAuthenticator, validateSPN } = require('../amps-kerberos-authenticator');
const { Client } = require('amps');


const IS_WIN = process.platform === 'win32';


// required variables that can also be set in the the environment
const host = process.env.AMPS_HOST || 'localhost';
const port = process.env.AMPS_PORT || 8557;
const user = process.env.AMPS_USER || '60East';
const uri = `ws://${user}@${host}:${port}/amps/json`;
const spn = `AMPS/${host}`;


beforeAll(function(done) {
    if (!IS_WIN && (!process.env.KRB5_CONFIG || !process.env.KRB5_CLIENT_KTNAME)) {
        console.error('Kerberos environment variables are not set');
        return process.exit(1);
    }

    // everything is ready for testing
    done();
});


it('Obtain Token', async function() {
    const authenticator = new AMPSKerberosAuthenticator(spn);
    const token = await authenticator.authenticate(null, null);
    expect(token.startsWith('YII')).toBeTruthy('Token is valid');
});


it('Pub/Sub with Kerberos Authenticator', async function() {
    return new Promise(async function(resolve, reject) {
        const client = new Client('kerberosTestPubSub');

        try {
            // connect
            await client.connect(uri, new AMPSKerberosAuthenticator(spn));

            // subscribe
            await client.subscribe(message => {
                if (message.data && message.data.id === 9) {
                    resolve();
                    client.disconnect();
                }
            }, 'orders');

            // publish
            for (let i = 0; i < 10; ++i) {
                client.publish('orders', {id: i + 1});
            }
        }
        catch (err) {
            reject(err);
        }
    });
});


it('Multiple Auth', async function() {
    const authenticator = new AMPSKerberosAuthenticator(spn);
    const client = new Client('KerberosTestPublisher');

    let i = 0;
    while (i++ < 10) {
        await client.connect(uri, authenticator);
        await client.disconnect();
    }
});


it('Multiple Auth with Failure', async function() {
    const authenticator = new AMPSKerberosAuthenticator(spn);
    const client = new Client('KerberosTestPublisher');

    let errorsThrown = 0;

    let i = 0;
    while (i < 10) {
        if (i++ % 2 === 0) {
            await client.connect(uri, authenticator);
        }
        else {
            try {
                await client.connect(uri);
            }
            catch (err) {
                errorsThrown++;
                expect(err.message.reason).toBe('auth failure', 'Correct logon failure reason reported');
            }
        }

        await client.disconnect();
    }

    expect(errorsThrown).toEqual(5, '5 Logon failures should occur');
});


it('Undefined SPN', async function() {
    const authenticator = new AMPSKerberosAuthenticator('AMPS/foo.com');
    let errorThrown = null;

    try {
        await authenticator.authenticate(null, null);
    }
    catch (err) {
        errorThrown = err;
        expect(err).toBeDefined('Error should be defined');
    }

    expect(errorThrown).toBeDefined('Error object should be thrown for an undefined SPN')
});


it('SPN Validator', function(done) {
    let spns = [
        'AMPS/localhost',
        'AMPS/localhost:1234',
        'AMPS/localhost.localdomain',
        'AMPS/localhost.localdomain:1234',
        'AMPS/ac-1234.localhost.com',
        'AMPS/ac-1234.localhost.com:1234',
    ];

    const spnsWithRealm = [
        'AMPS/localhost@SOMEREALM',
        'AMPS/localhost@SOMEREALM.COM',
        'AMPS/localhost@SOME.REALM.COM',
        'AMPS/localhost:1234@SOMEREALM',
        'AMPS/localhost:1234@SOMEREALM.COM',
        'AMPS/localhost:1234@SOME.REALM.COM',
        'AMPS/localhost.localdomain@SOMEREALM',
        'AMPS/localhost.localdomain@SOMEREALM.COM',
        'AMPS/localhost.localdomain@SOME.REALM.COM',
        'AMPS/localhost.localdomain:1234@SOMEREALM',
        'AMPS/localhost.localdomain:1234@SOMEREALM.COM',
        'AMPS/localhost.localdomain:1234@SOME.REALM.COM',
    ]

    let invalidSpns = [
        'FOO',
        'localhost.localdomain',
        'AMPS@localhost',
        'AMPS@localhost.localdomain',
        'AMPS@localhost.localdomain',
        'AMPS@localhost.localdomain/FOO',
    ];

    if (IS_WIN) {
        spns = spns.concat(spnsWithRealm);
    }
    else {
        invalidSpns = invalidSpns.concat(spnsWithRealm);
    }

    for (const currentSpn of spns) {
        validateSPN(currentSpn);
    }

    for (const currentSpn of invalidSpns) {
        let errorThrown = false;

        try {
            validateSPN(currentSpn);
        }
        catch (err) {
            errorThrown = true;
        }

        expect(errorThrown).toBeTruthy('A detected invalid SPN should throw an error');
    }

    done();
});
