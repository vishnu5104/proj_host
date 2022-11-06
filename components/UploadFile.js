import React from 'react';

import getStorageProvider, { getWalletInstance } from '../lib/storageProvider';

import Button from './Button';
import Loader from './Loader';

export class UploadFile extends React.Component {
    onRef = (el) => {
        this.inputRef = el;
    };

    onSubmit = async (ev) => {
        ev.preventDefault();

        const sp = await getStorageProvider();
        const uploader = await sp.getUploader();
        uploader.onSuccess = () => {
            window.alert('File uploaded.');
            window.location.reload();
        };

        for (const file of this.inputRef.files) {
            await uploader.upload(file);
        }
    };

    render() {
        return (
            <form class="content" onSubmit={this.onSubmit}>
                <label class="sty" htmlFor="upload-file-input">
                    Upload your Land Document
                </label>
                &nbsp;
                <input id="upload-file-input" type="file" ref={this.onRef} />
                <button class="btn-c" type="submit">
                    Submit
                </button>
            </form>
        );
    }
}
