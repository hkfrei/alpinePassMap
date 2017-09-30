# Swiss mountain pass map

Plan your cycling route over various swiss mountain passes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
See deployment for notes on how to deploy the project on a live system.

You can get a local copy of the project by running this command on your console:
```
git clone git@github.com:hkfrei/alpinePassMap.git
```
After that you should enter the newly created directory by typing
```zsh
cd alpinePassMap
```

### Prerequisites

The project needs the package manager [Yarn](https://yarnpkg.com/). Please install it from [here](https://yarnpkg.com/en/docs/install)


### Installing

While in the newly created folder, install all the dependencies.
```zsh
yarn install
```

After that, you can start a development server by enter the following command...
```zsh
yarn run blendid
```

This is where the magic happens. The perfect front-end workflow. This runs the development task, which starts compiling, watching, and live updating all our files as we change them. Browsersync will start a server on port 3000, or do whatever you've configured it to do. You'll be able to see live changes in all connected browsers. Don't forget about the additional Browsersync UI tools available on port 3001!




A step by step series of examples that tell you have to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

```zsh
yarn run blendid -- build
```

Compiles files for production to your destination directory. JS files are built with webpack 3 with standard production optimizations (uglfiy, etc.). CSS is run through CSSNano. If `rev` is set to `true` in your `task-config.js` file, filenames will be hashed (file.css -> file-a8908d9io20.css) so your server may cache them indefinitely. A `rev-manifest.json` file is output to the root of your `dest` directory (`public` by default), and maps original filenames to hashed ones. Helpers exist for Rails and Craft that read this file and automatically update filenames in your apps. CSS and HTML files read this file and string-replace filenames automatically.
After that, you can copy the contents of the public folder to your webserver of choice.

## Built With

* [BLENDID](https://github.com/vigetlabs/blendid/blob/master/README.md) - The build tools used
* [YARN](https://yarnpkg.com/) - Package Management
* [Google Maps API](https://developers.google.com/maps/documentation/javascript/) - Mapping library

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Hanskaspar Frei** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* The awesome BLENDID task and build tools. 
* Vince Garcia my cycling buddy who drove many of those passes with me;-)
