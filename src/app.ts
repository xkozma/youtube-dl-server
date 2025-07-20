#!/usr/bin/env node

import express from 'express';
const cors = require('cors');
const compression = require('compression')
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import {YoutubeDl} from "./YoutubeDl";

// Load .env
dotenv.config();

// Write COOKIE_SECRET to /tools/bin/cookies.txt
const cookiesTxtPath = path.join(__dirname, '../cookies.txt');
const cookieSecret = process.env.COOKIE_SECRET;
if (cookieSecret) {
    fs.mkdirSync(path.dirname(cookiesTxtPath), { recursive: true });
    fs.writeFileSync(cookiesTxtPath, cookieSecret, { encoding: 'utf8' });
}

const app = express();
const port = process.env.PORT || 8080;

app.use(compression())
app.use(cors())

app.get('/v1/video', async (req, res) => {
    try {
        const url = req.query.url as string;
        const cliOptions = req.query.options as string;
        const cli = req.query.cli as "youtube-dl" | "yt-dlp";
        if(!url){
            res.status(400);
            res.send('Missing url');
            return;
        }
        if (cli && cli !== "youtube-dl" && cli !== "yt-dlp"){
            res.status(400);
            res.send('Unsupported cli. valid options: youtube-dl | yt-dlp');
            return;
        }
        let schema = req.query.schema as string[];
        let metadata = await YoutubeDl.getVideoMetadata(url, {cli, cliOptions}, schema);
        res.json(metadata);
    } catch (e) {
        console.error(e)
        res.status(500);
        res.send(e);
    }
});

app.get('/watch', async (req, res) => {
    try {
        const v = req.query.v as string;
        const cliOptions = req.query.options as string;
        const cli = req.query.cli as "youtube-dl" | "yt-dlp";
        if(!v){
            res.status(400);
            res.send('Missing video id!');
            return;
        }
        if (cli && cli !== "youtube-dl" && cli !== "yt-dlp"){
            res.status(400);
            res.send('Unsupported cli. valid options: youtube-dl | yt-dlp');
            return;
        }
        let metadata = await YoutubeDl.getVideoMetadata(v, {cli, cliOptions}, ['url']);
        res.redirect(metadata.url);
    } catch (e) {
        console.error(e)
        res.status(500);
        res.send(e);
    }
});

app.listen(port, () => {
    console.log(`server is listening on http://localhost:${port}`);
    console.log(`Try this url in your browser: http://localhost:${port}/watch?v=dQw4w9WgXcQ`);
});
