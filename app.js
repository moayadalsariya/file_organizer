const inquirer = require('inquirer');
const figlet = require("figlet");
const dir_name = require("./config/dir_name.json");
const chalk = require("chalk");
const fs = require("fs");
const patt1 = /\.([0-9a-z]+)(?:[\?#]|$)/i;
let testFolder = "";
let choices = [];

function getDirectory(target, choices) {
    let toReturn = "";
    for (let key in choices) {
        if (choices[key].indexOf(target) != -1 && choices[key] != undefined) {
            toReturn = key;
            break;
        } else {
            toReturn = "undefined";
        }
    }
    return toReturn;
}

function createJSON(options) {
    let toReturn = {};
    for (let option of options) {
        toReturn[option] = dir_name[option];
    }
    return toReturn;
}
console.log(chalk.blue(figlet.textSync('File Organizer')));
console.log(chalk.green("Welcome to file organizer, command line tool help you to organise  your files \n\n"));

inquirer
    .prompt([{
            type: "input",
            message: chalk.cyan("Please type dir path you want to sort it"),
            name: "dir",
            default: "~/Downloads/",
            validate: function (value) {
                var pass = value.match(
                    /^\/$|(\/[a-zA-Z_0-9-]+)+\/$/g
                );
                if (pass) {
                    return true;
                }

                return 'Please type a valid dir';
            }

        },
        {
            type: "checkbox",
            message: chalk.cyan("please choose the type of files you want to sort"),
            name: "choices",
            choices: ["./images", "./videos", "./audios", "./powerPoints", "./wordDocs", "./PDF", "./archives", "./executable_files", "./excel"],
            validate: function (answers) {
                if (answers.length < 1) {
                    return 'You must choose at least one topping.';
                }
                return true;
            }


        }

    ])
    .then(answers => {
        testFolder = answers.dir;
        choices = createJSON(answers.choices);
        let array = [];

        // read all the files of the testFolders and store on arrays variable
        fs.readdirSync(testFolder).forEach(file => {
            if (file.match(patt1) !== null) {
                array.push(file);
            }
        });
        for (let file of array) {
            let fileExention = file.match(patt1)[0];
            let folder = getDirectory(fileExention, choices);
            if (folder == "undefined") {
                continue;
            }

            // if the folder does not exitst
            folder = folder.slice(2, folder.length);
            if (!fs.existsSync(`${testFolder}${folder}`)) {
                console.log(`${folder} created`);
                fs.mkdirSync(`${testFolder}${folder}`);
            }

            // moving file to the right folder
            folder = getDirectory(fileExention, choices);
            fs.rename(`${testFolder}${file}`, `${testFolder}${folder}/${file}`, function (err) {
                console.log(`moving ${file} with extension ${fileExention} to ${folder}`);
            })

        }
        if (array.length == 0) {
            console.log(chalk.red(`the ${answers.dir} has no files`));
        }

        array = [];
    })
    .catch(error => {
        if (error.isTtyError) {
            console.log("Prompt couldn't be rendered in the current environment")
        } else {
            console.log("Something else when wrong");
        }
    });