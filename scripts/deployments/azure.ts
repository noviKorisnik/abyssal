import { copyFileSync, mkdirSync, rmSync, renameSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import * as fs from 'fs';

const deployDecoupled = () => {
    const rootDir = path.resolve(__dirname, '../../');
    const serverDir = path.join(rootDir, 'server');
    const deployDir = path.join(rootDir, 'deploy');

    // Clean and create deploy directory
    rmSync(deployDir, { recursive: true, force: true });
    mkdirSync(deployDir, { recursive: true });

    // Build server
    console.log('Building server...');
    execSync('npm run build', { 
        cwd: serverDir,
        stdio: 'inherit'
    });

    // Copy build output to deploy root
    execSync('xcopy /E /I dist "' + path.join(deployDir, 'dist') + '"', {
        cwd: serverDir,
        stdio: 'inherit'
    });

    // Modify package.json for production
    const packageJson = require(path.join(serverDir, 'package.json'));
    
    // Keep only the start script
    packageJson.scripts = {
        start: 'node dist/index.js'
    };
    
    // Add Node.js version requirement
    packageJson.engines = {
        node: '>=22.0.0'
    };
    
    // Remove devDependencies
    delete packageJson.devDependencies;

    fs.writeFileSync(
        path.join(deployDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );
    
    // Create .deployment file to prevent Azure from rebuilding
    fs.writeFileSync(
        path.join(deployDir, '.deployment'),
        '[config]\nSCM_DO_BUILD_DURING_DEPLOYMENT=false\n'
    );

    // Install production dependencies
    console.log('Installing production dependencies...');
    execSync('npm install --omit=dev', {
        cwd: deployDir,
        stdio: 'inherit'
    });

    console.log('Deployment preparation completed successfully!');
};

deployDecoupled();
