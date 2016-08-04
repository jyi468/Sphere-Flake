/**
 * Created by jyi on 5/21/2016.
 */

//browserify js/main.js -o > bundle.js -d

init();



function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xEEEEEE);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    fontLoader = new THREE.FontLoader();

    fontLoader.load('resources/fonts/helvetiker_regular.typeface.json', function (font) {
        helvetiker = font;
        esrecurse.visit(ast, {
            VariableDeclaration: VariableDeclaration
        });
    });

    origin = new THREE.Vector3(0, 0, 0);

    render();
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


function VariableDeclaration(node) {
    node.declarations.forEach(function(declarator) {

        // BinaryExpression, UnaryExpression, etc.
        var expression = declarator.init;
        var expressionType = expression.type;
        var left = expression.left;
        var right = expression.right;

        var leftVisitorOptions = {};
        var rightVisitorOptions = {};

        leftVisitorOptions[expressionType] = nodeMap[expressionType];
        rightVisitorOptions[expressionType] = nodeMap[expressionType];

        // Create new Visitor with type specified in visitorOptions
        // Ex. {BinaryExpression: BinaryExpression}
        var leftVisitor = new esrecurse.Visitor(leftVisitorOptions);
        var rightVisitor = new esrecurse.Visitor(leftVisitorOptions);
        leftVisitor.visit(left);
        rightVisitor.visit(right);
        console.log(declarator);
    });

    //this.visit(left);
    //this.visit(right);
}

function BinaryExpression(node) {
    var left = node.left;
    var right = node.right;

    if (left.type === "Literal") {
        // If literal, just create the var in space
        createLiteralText(left.raw);
    } else {
        // Must be another type of expression
    }

    if (right.type === "Literal") {
        // If literal, just create the var in space
        createLiteralText(right.raw);
    } else {
        // Must be another type of expression
    }
}

function createLiteralText(literalText) {
    // Need to add spheres around text
    var textGeometry = new THREE.TextGeometry(literalText, {font: helvetiker, size: 5, height: 2});
    var textMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff});
    var text = new THREE.Mesh(textGeometry, textMaterial);

    scene.add( text );
}

// Visualization
// 1 - recurse through nodes
// 2 - show box with 23 * 576
// 3 - evaluate expression and leave box with x as being equal to 13248

// Notes
// We will have to touch on EVERY single type that is here
// Think of a strategy of how to get correct data, when, where to save it and how to visualize it
// How to step through