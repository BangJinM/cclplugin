## Shader Node

Used for creating and parsing shader nodes.

---

### Automatic Node Library Generation

The code for the node library is parsed by executing **.scripts/generate.js** on the **chunks and masters** defined within 
shader-templates, dynamically creating code in the **assets/operation** directory.

**Template**
- chunk
    - common
    - input_basic
    - math
    - noise
    - range
    - shape
    - uv
- master
    - SurfaceMasterNode
    - UnlitMasterNode

---

**Generated Nodes**
- Input
    - Basic
        - Float
        - Boolean
        - Slider
        - Vector2
        - Vector3
        - Vector4
        - Color
        - Time
    - Geometry
        - NormalVector
        - Position
        - UV
        - VertexColor
        - ViewDirection
    - Texture
        - SimpleTexture2D
    - Variable
        - GetLocalVar
        - RegisterLocalVar
- Math
    - Advanced
        - Absolute
        - Exponential
        - Length
        - Log
        - Module
        - Negate
        - Normalize
        - Posterize
        - ReciprocalSquare
        - Reciprocal
    - Basic
        - Add
        - Divide
        - Multiply
        - Power
        - Square
        - Substract
    - Derivative
        - DDX
        - DDXY
        - DDY
    - Interpolation
        - InverseLerp
        - Lerp
        - Smoothstep
    - Range
        - Clamp
        - Fraction
        - Max
        - Min
        - OneMinus
        - RandomRange
        - Remap
        - Saturate
    - Round
        - Ceil
        - Floor
        - Round
        - Sign
        - Step
        - Truncate
    - Trigonometry
        - Arccosine
        - Arcsine
        - Arctangent
        - Arctangent2
        - Cosine
        - DegressToRadians
        - HyperbolicCosine
        - HyperbolicSine
        - Hyperbolic
        - RadiansToDegrees
        - Sine
        - Tangent
    - Vector
        - CrossProduct
        - Distance
        - DotProduct
        - Fresnel
        - Projection
        - Reflection
        - SphereMask
    - Wave
        - NoiseSineWave
        - SawtoothWave
        - SquareWave
        - TriangleWave
- Procedural
    - Noise
        - GradientNoise
        - SimpleNoise
    - Shape
        - Ellipse
        - Rectangle
        - RoundRectangle
- Uv
    - PolarCoordinates
    - RotateCoordinates
    - TillingAndOffset
- Channel
    - Combine
    - Split
- Logic
    - AI
    - And
    - Any
    - Branch
    - Comparison
    - IsNan
    - Not
    - Or

---

## How to define the node class

```typescript
// This path needs to be modified according to the path where you are storing it
import { register } from '../../../../graph/register';
import { ShaderNode } from '../../../base';
import { slot } from '../../../utils';

@register({
    // Menu for creating a node
    menu: 'Custom/Foo',
    // The name of the node
    title: 'Foo',
    // The style of the node
    style: {
        headerColor: '#ff1e00'
    },
    // Whether the node is a master node (master nodes are not deleted, there is only one master node)
    master: false,
})
export class Foo extends ShaderNode {
    // Define properties on the node
    // slot is similar to prop in that it defines information about the properties on the node.
    // Parameter one [string]: name
    // parameter two [any]: default value
    // Parameter three [string]: type
    // Parameter four [string]: type of connection
    // Parameter five [Object]: custom object
    data = {
        // Input property list
        inputs: [
            slot('In', 0, 'float', 'vector'),
        ],
        // Output property list
        outputs: [
            slot('Out', 0, 'float', 'vector'),
        ],
        // List of attributes
        props: [
            prop('Prop', 99, 'float'),
        ],
    };

    /**
     * Generating an effect 
     */    
    generateCode() {
        const input0 = this.getInputValue(0);
        const output0 = this.getOutputVarDefine(0);
        
        return `
            ${output0} = ${input0};
        `;
    }
}
```

### Preview image

Menu:

<img src="../readme/自定义节点菜单.png" width="250px">

Node:

<img src="../readme/自定义节点.png" width="250px">

---

### Known issues

- Boolean variables are not currently supported
