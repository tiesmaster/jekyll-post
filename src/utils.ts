import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as moment from "moment";

export const postSnippet: string = `---
layout: post
title: TITLE
date: YYYY
categories: jekyll setup-dev-blog series
---

$\{1\}`;

var insertFrontMatter: boolean = false;

export function shouldInsertFrontMatter(): boolean {
  return insertFrontMatter;
}

export function setFrontMatter(flag: boolean): void {
  insertFrontMatter = flag;
}

export async function createFile(
  dirName: string,
  newFileName: string
): Promise<string> {
  let folders = vscode.workspace.workspaceFolders;
  if (folders === undefined || dirName === null || dirName === undefined) {
    return newFileName;
  }
  const templateName = ".post-template";
  const templatePath = path.resolve(folders[0].uri.fsPath, templateName);
  const fileName = path.resolve(dirName, newFileName);
  const templateExists: boolean =
    templatePath !== undefined && fs.existsSync(templatePath);
  const fileExists: boolean = fs.existsSync(fileName);
  const frontMatter = templateExists ? fs.readFileSync(templatePath) : "";
  setFrontMatter(!fileExists && !templateExists);
  if (!fileExists) {
    fs.appendFileSync(fileName, frontMatter);
  }
  return fileName;
}

export async function openFile(fileName: string): Promise<vscode.TextEditor> {
  const stats = fs.statSync(fileName);

  if (stats.isDirectory()) {
    throw new Error("This file is a directory!");
  }

  const doc = await vscode.workspace.openTextDocument(fileName);
  if (!doc) {
    throw new Error("Could not open file!");
  }

  const editor = vscode.window.showTextDocument(doc);
  if (!editor) {
    throw new Error("Could not show document!");
  }
  return editor;
}

export async function getPostTitleFromUser(): Promise<string> {
  const defaultTitle = "";
  let question = `What's the name of the new post?`;

  let title = await vscode.window.showInputBox({
    prompt: question,
    value: defaultTitle
  });
  if (title === null || title === undefined) {
    return defaultTitle;
  }
  return title || defaultTitle;
}

export function getDateTime(): string {
  var today = new Date();
  return moment().format("YYYY-MM-DD HH:mm:ss ZZ");
}

export function addDateToFilename(fileName: string): string {
  if (fileName === null) {
    throw undefined;
  }
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  return yyyy + "-" + mm + "-" + dd + "-" + fileName;
}

export function convertTitleToFileName(postTitle: string): string {
  const loweredTitle = postTitle.toLowerCase();
  const snakeCase = loweredTitle.replace(" ", "-");
  return snakeCase + ".markdown";
}
