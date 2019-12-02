// new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         reject('hello');
//     }, 1000);
// }).then(function(x) {
//     console.log(x);
//     return 3;
// }).catch(function(e) {
//     throw new Error('noooo...');
//     return 6;
// }).finally(function() {
//     console.log('omg');
// }).then(function(x) {
//     console.log(x);
//     return true;
// }).catch(function(e) {
//     console.warn(e);
//     return false;
// }).finally(function() {
//     console.log('lol');
// });

// (new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         resolve('world');
//     }, 2000);
// })).then(function(value) {
//     console.log(value);
// }).catch(function(reason) {
//     console.warn(reason);
// });
//
//
// (new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         reject('hello');
//     }, 3000);
// })).then(function(value) {
//     console.log(value);
// }).catch(function(reason) {
//     console.warn(reason);
// });

// Promise.all([
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             resolve('i');
//         }, 100);
//     }),
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             resolve('like');
//         }, 3000);
//     }),
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             resolve('turtles');
//         }, 1000);
//     })
// ]).then(function(x) {
//     console.log.apply(console, x);
// }).catch(function(reason) {
//     console.warn(reason);
// });

// Promise.race([
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             reject('i');
//         }, 100);
//     }),
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             resolve('like');
//         }, 1000);
//     }),
//     new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             reject('turtles');
//         }, 3000);
//     })
// ]).then(function(x) {
//     console.log(x);
// }).catch(function(reason) {
//     console.warn(reason);
// });

Promise.allSettled([
    new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('i');
        }, 100);
    }),
    new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('like');
        }, 3000);
    }),
    new Promise(function(resolve, reject) {
        setTimeout(function() {
            reject('turtles');
        }, 1000);
    })
]).then(function(x) {
    console.log.apply(console, x);
}).catch(function(reason) {
    console.warn(reason);
});
