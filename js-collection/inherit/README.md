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
```

### 原型链

细心一点会发现，上面代码中实例访问`sayName`方法时是直接通过`.`运算符去访问的，并没有通过`__proto__`属性，即:

```javascript
bob.__proto__.sayName(); // undefind: this指向prototype,其没有name属性
```

原因是在访问对象的属性时，首先在其本身即this上查找，当没有找到该属性时就到对象的原型上去查找。这里很容易想到属性屏蔽的问题，即实例和其原型具有相同属性名的属性是，原型上的该属性将不可见。

```javascript
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;             // true
```

可以看到，构造函数的默认(这里说默认是因为构造函数的原型对象可以重写)原型对象是Object的实例，其`[[prototype]]`指向Object的原型，而Object的原型对象已经到头了，所以Object的原型对象的`[[prototype]]`为null。

看下面这个例子：

```javascript


```

## 继承的几种实现方式

## ES6中的继承

## 总结