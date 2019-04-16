# 聊聊JS中的继承

## JS中的类

继承来自与面向对象语言，如果一个类B“继承自”另一个类A，就把这个B称为“A的子类”，而把A称为“B的父类”也可以称“A是B的超类(super)”。子类具有父类的属性和方法，打到代码复用的目的。在ES6之前，JS中是没有类的概念的，包括ES6以后的Class也是一个语法糖的实现。 JS中的继承是依赖**原型**实现的，至于JS中为甚么没有‘类’，以及**原型**的由来，[阮一峰老师这儿讲的很清楚](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)。

## 原型与原型链

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

```javascript
console.log

```

## 继承的几种实现方式

## ES6中的继承

## 总结