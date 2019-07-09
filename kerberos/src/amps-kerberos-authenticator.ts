////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2012-2019 60East Technologies Inc., All Rights Reserved.
//
// This computer software is owned by 60East Technologies Inc. and is
// protected by U.S. copyright laws and other laws and by international
// treaties.  This computer software is furnished by 60East Technologies
// Inc. pursuant to a written license agreement and may be used, copied,
// transmitted, and stored only in accordance with the terms of such
// license agreement and with the inclusion of the above copyright notice.
// This computer software or any other copies thereof may not be provided
// or otherwise made available to any other person.
//
// U.S. Government Restricted Rights.  This computer software: (a) was
// developed at private expense and is in all respects the proprietary
// information of 60East Technologies Inc.; (b) was not developed with
// government funds; (c) is a trade secret of 60East Technologies Inc.
// for all purposes of the Freedom of Information Act; and (d) is a
// commercial item and thus, pursuant to Section 12.212 of the Federal
// Acquisition Regulations (FAR) and DFAR Supplement Section 227.7202,
// Government's use, duplication or disclosure of the computer software
// is subject to the restrictions set forth by 60East Technologies Inc..
//
////////////////////////////////////////////////////////////////////////////

import { Authenticator } from 'amps';
import { initializeClient, KerberosClient } from 'kerberos';


const IS_WIN = process.platform === 'win32';


export class AMPSKerberosAuthenticator implements Authenticator {
    private spn: string;
    private client: KerberosClient;

    constructor(spn: string) {
        // validate the SPN first
        validateSPN(spn);

        if (!IS_WIN) {
            this.spn = spn.replace(/\//g, '@');
        }

        this.client = null;
    }

    private context = async() => {
        if (!this.client) {
            this.client = await initializeClient(this.spn);
        }

        return this.client;
    }

    async authenticate(login: string, password: string): Promise<string> {
        return (await this.context()).step('');
    }

    async retry(login: string, password: string): Promise<string> {
        return this.authenticate(login, password);
    }

    completed(login: string, password: string, reason: string): void {
        this.client = null;
    }
}


export function validateSPN(spn: string): void {
    // validation patterns
    const hostPattern =
    '(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])';
    let spnPattern = `^(\\w+/)(${hostPattern})(:\\d+)?`;
    let spnFormat;

    if (IS_WIN) {
        const realmPattern = '@[\\w\\d]+([\\.\\w\\d]*)?';
        spnPattern = `${spnPattern}(${realmPattern})?$`;
        spnFormat = '<service>/<host>[:<port>][@REALM]';
    }
    else {
        spnFormat = '<service>/<host>[:<port>]';
        spnPattern = `${spnPattern}$`;
    }

    if (!spn.match(new RegExp(spnPattern))) {
        throw new Error(`The specified SPN ${spn} does not match the format ${spnFormat}`);
    }
}
