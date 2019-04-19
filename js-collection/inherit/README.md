# 聊聊JS中的继承

## JS中的类

继承来自面向对象语言，如果一个类B“继承自”另一个类A，就把这个B称为“A的子类”，而把A称为“B的父类”也可以称“A是B的超类(super)”。子类具有父类的属性和方法，达到代码复用的目的。继承是类三大特性（封装、继承、多态）之一，在ES6之前，JS中是没有类的概念的，包括ES6以后的class也是语法糖的实现。JS中的继承是依赖**原型**实现的，至于JS中为甚么没有‘类’，以及**原型**的由来，[阮一峰老师这儿讲的很清楚](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)。

## 原型与原型链

### `__proto__`和`prototype`

在JS中通过构造函数来创建一个实例：

```javascript
function Person (name) {
    this.name = name;
}

const bob = new Person('bob');
const jack = new Person('jack');

console.log(bob.name, jack.name); // bob, jack
```

这里创建了一个构造函数Person，并使用new关键字构造了两个实例bob和jack，他们都拥有一个name属性，两者之间**互不干扰**，接下来将bob和jack同时打印出来；

![1.jpg](https://github.com/hyden-tan/blog/raw/master/js-collection/inherit/images/1.png)

可以看到出了name属性之外，还包含了一个`__proto__`属性:
> 遵循ECMAScript标准，someObject.[[Prototype]] 符号是用于指向 someObject的原型。从 ECMAScript 6 开始，[[Prototype]] 可以通过 Object.getPrototypeOf() 和 Object.setPrototypeOf() 访问器来访问。这个等同于 JavaScript 的非标准但许多浏览器实现的属性 `__proto__`。

这里已经知道`__proto__`指向了bob的原型，即指向bob的构造函数Person的`prototype`属性，这里可以把Person打印出来：

```javascript
bob.__proto__ === Person.prototype; // true
```

要想在bob和jack之间即Person的所有实例之前共享一些属性或者方法可以通过编辑Person的原型`Person.prototype`来实现：

```javascript
Person.prototype.sayName = function () {
    return this.name;
}

console.log(bob.sayName(), jack.sayName()); // 'bob' 'jack'
```

再次打印bob时，会发现`__proto__`里面多出了一个sayName属性，通过这样的方式就可以在实例之间共享一些属性。要注意的是不要将`Person.prototype`和`__proto__`混淆：实例通过自身的`__proto__`属性访问其构造函数的原型对象`prototype`。

到这里会有一个问题，在刚开始定义Person时，并没有定义`prototype`属性，那么构造函数的`prototype`是哪里来的？

> 无论什么时候，只要创建了一个新函数，就会根据一组特定的规则为该函数创建一个 prototype 属性，这个属性指向函数的原型对象。在默认情况下，所有原型对象都会自动获得一个 constructor (构造函数)属性，这个属性包含一个指向 prototype 属性所在函数的指针。

```javascript
Person.prototype.constructor === Person; // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;             // true
```

可以看到，构造函数的默认(这里说默认是因为构造函数的原型对象可以重写)原型对象是Object的实例，其`[[prototype]]`指向Object的原型，而Object的原型对象已经到头了，所以Object的原型对象的`[[prototype]]`为null。

### 原型链

细心一点会发现，上面代码中实例访问`sayName`方法时是直接通过`.`运算符去访问的，并没有通过`__proto__`属性，即:

```javascript
bob.__proto__.sayName(); // undefind: this指向prototype,其没有name属性
```

原因是在访问对象的属性时，首先在其本身即this上查找，当没有找到该属性时就到对象的原型上去查找。这里很容易想到属性屏蔽的问题，即实例和其原型具有相同属性名的属性是，原型上的该属性将不可见。

看下面这个例子：

```javascript
function A () {}
A.prototype.sayHi = function () {
    console.log('Hi');
}

function B () {}
B.prototype = new A();

const instance = new B();
instance.sayHi();   // Hi
```

在A上定义了sayHi, 然后定义了B，并将其原型改写为A的实例，创建一个B的实例instance，其访问sayHi的顺序如下:

instance自身(空对象) -> instance.__proto__(A的实例，也是一个空对象) -> instance.__proto__.__proto__（A的原型，找到sayHi）

当实例本身上并不存在该属性时，会访问其原型，由于原型本身也是一个对象，如果访问不到的话就继续访问原型的原型，不断回溯，直到找到该属性或者到null。这个过程相当于是一次链表的查找，这就是原型链的由来。

### 引申：Function & Object 鸡蛋问题

附上一片[文章](https://mp.weixin.qq.com/s/4eBdJTGBIrB5JhvRrmmbaw)

## 继承的几种实现方式

继承本身也像是一条链，所以虽然JS中没有”真正的类“,但通过原型链也可以实现继承，接下来就谈谈几种继承的实现方式，大部分内容来自《js高级程序设计》，很香。

### 借用构造函数

```javascript
function SuperType(){
    this.colors = ["red", "blue", "green"];
}
SuperType.prototype.mention = '借用构造函数无法继承原型上的属性';

function SubType(){
    SuperType.call(this);
}

const instance1 = new SubType();
const instance2 = new SubType();

instance1.colors.push("black");

console.log(instance1.colors);    //"red,blue,green,black"
console.log(instance2.colors);    //"red,blue,green"
console.log(instance1.mention);   // undefind
```

所谓的“借调”即通过使用 call()方法(或 apply()方法 也可以)在子类的构造函数中调用父类构造函数，因为子类的this绑定给了父类构造函数,所以父类的构造函数里的属性就会添加到子类的实例上，实际上相当于用父类的构造函数对子类构造函数进行了扩展。但像代码中展现的一样，劣势很明显，无法继承（链接到）父类的prototype， 而其优势在于可以向父类构造函数传参。

### 组合继承

```javascript
function SuperType(name){
        this.name = name;
        this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
    console.log(this.name);
}

function SubType(name, age){
    SuperType.call(this, name);
    this.age = age;
}
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function(){
    console.log(this.age);
};

const instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");

console.log(instance1.colors);  //"red,blue,green,black"
instance1.sayName();    //"Nicholas";
instance1.sayAge(); // 29

const instance2 = new SubType("Greg", 27);
console.log(instance2.colors);  //"red,blue,green"
instance2.sayName();    //"Greg";
instance2.sayAge(); //27
```

组合继承相当于是借用构造函数的加强版，通过将父类的实例重写子类的原型，这样子类的原型就可以链接到父类的原型。这里需要注意一个小细节：

```javascript
SubType.prototype.constructor = SubType;
```

构造函数的原型对象上的constructor指向构造函数本身，这里因为重新赋值被改写了，所以需要修正回来。

组合继承有个缺点，父类的构造函数会被调用两次，一次是创建实例给子类的prototype，另一次是在子类的构造函数里面借调的。

### 原型继承

```javascript
function object(o) {
    function f() {}
    f.prototype = o;
    return new f();
}
const parent = {
    name: 'parent',
    colors: ['black', 'red'],
}
const o1 = object(parent);  
const o2 = object(parent);

console.log(o1.colors); // ["black", "red"]
console.log(o2.colors); // ["black", "red"]

o1.colors.push('green');
console.log(o2.colors); // ["black", "red", "green"]
```

原型继承大致可以描述为: 创建一个给定原型的对象。ECMAScript 5 通过新增 Object.create()方法规范化了原型式继承。其行为与上述方式相同。

### 寄生式继承

```javascript
function createAnother(origin) {
    const clone = object(origin);
    clone.sayHi = function () {
        return 'Hi';
    }
}
```

寄生式继承的思路与寄生构造函数和工厂模式类似，即创建一个**仅用于封装继承过程**的函数，该函数在内部以**某种方式**来增强对象。

> 使用寄生式继承来为对象添加函数，会由于不能做到函数复用而降低效率; 这一点与构造函数模式类似。

### 寄生组合式继承

```javascript
function inheritPrototype(subType, superType){
    var prototype = object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

function SuperType(name){
        this.name = name;
        this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
    console.log(this.name);
};

function SubType(name, age){
    SuperType.call(this, name);
    this.age = age;
}

inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function(){
    console.log(this.age);
};
```

相对于组合继承直接用父类实例改写子类原型的做法，寄生组合式继承的方式更加细腻了一些，通过寄生的方式，通过父类的原型创建一个对象给子类的原型，这样子类的`prototype`通过`[[prototype]]`可以链接到父类，更加优雅的实现了继承，且只调用了一遍父类的构造函数。

## ES6中的class

```javascript
class A {
    constructor(name) {
        this.name = name;
    }
    static getMaxNumber(a, b) {
        return a > b ? a : b;
    }
    sayName() {
        console.log(this.name);
    }
}
```

在es6中定义了class关键字，但其依旧是function + 原型的语法糖：

```javascript
typeof A === 'function'; // true
```

可以看到A本身依旧是一个function，那A里面的方法是放到哪儿的呢？

![2.jpg](https://github.com/hyden-tan/blog/blob/master/js-collection/inherit/images/2.png?raw=true)

可以看到，sayName是放在A的prototype上面的，这个不难解释得通，因为类的方法是可以被子类继承的，所以sayName在A的prototype上合情合理，

在打印出来的原型中，并没有`getMaxNumber`,因为静态属性不能被实例继承，只能由类直接调用，所以静态属性是直接挂载到类上的，这也是为什么不能再静态属性中访问this,因为通过类直接调用的话，this指向类本身。另外要说明的是虽然静态方法是挂载类上的，但由于其是不可枚举的，所以无法通过Object.keys这样的方式取到的。

![3.jpg](https://github.com/hyden-tan/blog/blob/master/js-collection/inherit/images/3.png?raw=true)

到目前为止，js里还没有一个完善的私有属性的定义方式，不过在提案中已经有通过‘#’定义私有属性的方式：

```javascript
class B {
    #name;
}
```

## 总结

第一次认真写文章，前前后后写了有四五个小时吧，总算把js的原型和继承捋了一遍，有些地方可能还讲的不够细，后面会再翻看一些资料，查漏补缺。

欢迎指正！[github](https://github.com/hyden-tan/blog/blob/master/js-collection/inherit/README.md)