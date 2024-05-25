// const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



console.log('webpack:',__dirname,__filename);
// module.exports = {
    
const config = {    
    resolve: {
        extensions: ['.js', '.jsx'],
    },  
    mode: 'development',
    entry: './src/main.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        
            rules: [
                {
                  test: /\.css$/,
                  use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader', // Add this for Tailwind CSS
                  ],
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-react'],
                        },
                    },
                },
               /* {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },*/
                {
                    test: /\.svg$/,
                    use: {
                      loader: 'file-loader',
                      options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/',
                      },
                    },
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: [
                      {
                        loader: 'file-loader',
                        options: {
                          name: '[name].[ext]',
                          outputPath: 'assets/',
                        },
                      },
                    ],
                  }
            ],
        
    },
    
};

export default config;