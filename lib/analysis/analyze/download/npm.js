'use strict';

const fs = require('fs');
const got = require('got');
const log = require('npmlog');
const untar = require('./util/untar');
const gotRetries = require('../util/gotRetries');

const logPrefix = 'collect/npm';
const blacklist = {
    yourmom: true,      // Huge tar bomb..
    'tone-police': true,  // Was causing the registry to crash while downloading..
};

function download(url, target, tmpDir) {
    const tarballFile = `${tmpDir}/tarball.tar`;

    log.verbose(logPrefix, `Will download tarball of ${target}..`);

    return new Promise((resolve, reject) => {
        got.stream(url, { timeout: 15000, retries: gotRetries })
        .on('error', (err) => reject(err))
        .pipe(fs.createWriteStream(tarballFile))
        .on('error', reject)
        .on('finish', resolve);
    })
    .then(() => {
        log.verbose(logPrefix, `Successfully downloaded ${target} tarball, will now extract ..`,
            { tarballFile });

        return untar(tarballFile)
        .then(() => {
            log.verbose(logPrefix, `Extraction of ${target} tarball successful`, { tmpDir });
        }, (err) => {
            log.error(logPrefix, `Failed to extract ${target} tarball`, { err, tarballFile });
            throw err;
        });
    }, (err) => {
        // Check if the tarball does not exist
        if (err.statusCode === 404) {
            log.warn(logPrefix, `Download of ${target} tarball failed with 404`, { err });
            return;
        }

        log.error(logPrefix, `Download of ${target} tarball failed`, { err });
        throw err;
    });
}

function npm(packageJson) {
    return (tmpDir) => {
        // Check if this module is blacklisted
        // If it does, fail with an error that signals that this module should not be analyzed again
        if (blacklist[packageJson.name]) {
            const err = new Error(`Module ${packageJson.name} is blacklisted from the npm downloader`);

            return Promise.reject(Object.assign(err, { unrecoverable: true }));
        }

        const url = packageJson.dist && packageJson.dist.tarball;
        const target = `${packageJson.name}@${packageJson.version}`;

        // Check if there's a tarball.. yes that's right, there are some packages that don't have tarballs,
        // e.g.: roost-mongo@0.1.0
        if (!url) {
            log.warn(logPrefix, `No tarball url for ${target}`);
            return Promise.resolve();
        }

        return download(url, target, tmpDir)
        .return();
    };
}

module.exports = npm;