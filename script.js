document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("drawing-canvas");
    const context = canvas.getContext("2d");
    let shapes = []; // Array to store shapes drawn on the canvas
    let shapeId = 1; // Counter for assigning unique IDs to shapes
    let selectedShape = null; // Variable to store the selected shape
    let offsetX, offsetY; // Variables to store the offset between the mouse position and the shape position
    let isMoving = false; // Flag to track if a shape is currently being moved

    // Function to draw all shapes stored in the shapes array with increased stroke width
    function drawShapes() {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        context.lineWidth = 5; // Set the stroke width to 2 pixels (you can adjust this value as needed)
        shapes.forEach(shape => {
            context.beginPath();
            if (shape.type === "text") {
                context.fillText(shape.text, shape.x, shape.y);
            } else if (shape.type === "polyline") {
                context.moveTo(shape.points[0].x, shape.points[0].y);
                shape.points.forEach(point => {
                    context.lineTo(point.x, point.y);
                });
            } else if (shape.type === "circle") {
                context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            }
            context.stroke(); // Stroke the path with the updated line width
        });
    }


    // Function to handle adding text to the canvas
    function addText(text, id) {
        shapes.push({ id: id, type: "text", text: text, x: 50, y: 50 }); // Example starting position (50, 50)
        drawShapes();
    }

    // Function to handle adding a polyline to the canvas
    function addPolyline(points, id) {
        shapes.push({ id: id, type: "polyline", points: points });
        drawShapes();
    }

    // Function to handle adding a circle to the canvas
    function addCircle(x, y, radius, id) {
        shapes.push({ id: id, type: "circle", x: x, y: y, radius: radius });
        drawShapes();
    }

    // Function to handle selecting a shape
    function selectShape(x, y) {
        selectedShape = null;
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape.type === "text") {
                // For text, check if the click coordinates are within the bounding box of the text
                const width = context.measureText(shape.text).width;
                if (x >= shape.x && x <= shape.x + width && y >= shape.y - 10 && y <= shape.y + 10) {
                    selectedShape = shape;
                    offsetX = x - shape.x;
                    offsetY = y - shape.y;
                    break;
                }
            } else if (shape.type === "polyline") {
                // For polyline, check if the click coordinates are near any of its points
                const points = shape.points;
                for (let j = 0; j < points.length; j++) {
                    const point = points[j];
                    if (Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < 5) {
                        selectedShape = shape;
                        offsetX = x - point.x;
                        offsetY = y - point.y;
                        break;
                    }
                }
                if (selectedShape) {
                    break;
                }
            } else if (shape.type === "circle") {
                // For circle, check if the click coordinates are within the circle's radius
                const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                if (distance <= shape.radius) {
                    selectedShape = shape;
                    offsetX = x - shape.x;
                    offsetY = y - shape.y;
                    break;
                }
            }
        }
        if (selectedShape) {
            console.log("Selected shape:", selectedShape);
            isMoving = true; // Enable moving the shape
        } else {
            console.log("No shape selected");
            isMoving = false; // Disable moving if no shape is selected
        }
    }

    // Function to handle moving the selected shape
    function moveShape(x, y) {
        if (selectedShape && isMoving) {
            if (selectedShape.type === "text") {
                selectedShape.x = x - offsetX;
                selectedShape.y = y - offsetY;
            } else if (selectedShape.type === "polyline") {
                const deltaX = x - offsetX - selectedShape.points[0].x;
                const deltaY = y - offsetY - selectedShape.points[0].y;
                selectedShape.points.forEach(point => {
                    point.x += deltaX;
                    point.y += deltaY;
                });
            } else if (selectedShape.type === "circle") {
                selectedShape.x = x - offsetX;
                selectedShape.y = y - offsetY;
            }
            drawShapes();
        }
    }

    // Function to delete the selected shape
    function deleteShape() {
        if (selectedShape) {
            shapes = shapes.filter(shape => shape !== selectedShape); // Remove selected shape from shapes array
            selectedShape = null; // Deselect the shape
            drawShapes(); // Redraw canvas without the deleted shape
            console.log("Shape deleted");
        }
    }

    // Event listener for canvas clicks
    canvas.addEventListener("click", function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        selectShape(x, y);
    });

    // Event listener for canvas mousemove
    canvas.addEventListener("mousemove", function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        moveShape(x, y);
    });

    // Event listener for "Enter" key press
    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && selectedShape) {
            isMoving = false; // Stop moving the shape
            selectedShape = null; // Deselect the shape
            console.log("Shape moved and deselected");
        } else if (event.key === "Delete") {
            deleteShape(); // Delete the selected shape when "Delete" key is pressed
        }
    });

    // Event listener for Add Text button
    document.getElementById("add-text-btn").addEventListener("click", function() {
        const text = document.getElementById("text-input").value;
        const id = "text_" + shapeId++;
        addText(text, id);
    });

    // Event listener for Add Polyline button
    document.getElementById("add-polyline-btn").addEventListener("click", function() {
        // Example points for a polyline, you can customize this according to your needs
        const points = [{ x: 100, y: 100 }, { x: 200, y: 200 }, { x: 300, y: 100 }];
        const id = "polyline_" + shapeId++;
        addPolyline(points, id);
    });

    // Event listener for Add Circle button
    document.getElementById("add-circle-btn").addEventListener("click", function() {
        // Example parameters for a circle, you can customize this according to your needs
        const x = 400; // x-coordinate of the center
        const y = 400; // y-coordinate of the center
        const radius = 50;
        const id = "circle_" + shapeId++;
        addCircle(x, y, radius, id);
    });

    // Event listener for save button click
    document.getElementById("save-btn").addEventListener("click", function() {
        saveShapesToFile(shapes); // Call saveShapes function and pass shapes array
    });

    // Event listener for open button click
    document.getElementById("open-btn").addEventListener("click", function() {
        document.getElementById("file-input").click(); // Trigger click event on file input element
    });

    // Event listener for file input change
    document.getElementById("file-input").addEventListener("change", function(event) {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            loadShapesFromFile(file); // Call loadShapesFromFile function and pass the selected file
        }
    });

    // Function to save shapes to a file
    function saveShapesToFile(shapes) {
        const shapesData = JSON.stringify(shapes);
        const blob = new Blob([shapesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shapes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function to load shapes from a file
    function loadShapesFromFile(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const shapesData = event.target.result;
            shapes = JSON.parse(shapesData);
            console.log('Shapes loaded from file:', shapes);
            // Draw the loaded shapes on the canvas
            drawLoadedShapes(shapes);
        };
        reader.readAsText(file);
    }

    // Function to draw the loaded shapes on the canvas
    function drawLoadedShapes(shapes) {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Iterate over the loaded shapes
        shapes.forEach(shape => {
            if (shape.type === "text") {
                // Draw text
                context.fillText(shape.text, shape.x, shape.y);
            } else if (shape.type === "polyline") {
                // Draw polyline
                context.beginPath();
                shape.points.forEach((point, index) => {
                    if (index === 0) {
                        context.moveTo(point.x, point.y);
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                });
                context.stroke();
            } else if (shape.type === "circle") {
                // Draw circle
                context.beginPath();
                context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                context.stroke();
            }
        });
    }
});
