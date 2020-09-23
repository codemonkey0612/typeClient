class abc {
  @xx() private c: number;
  test() {
    console.log(this.c)
  }
}

function xx(): PropertyDecorator {
  return (target, property) => {
    console.log(target, property)
    // @ts-ignore
    target[property] = 2;
  }
}

const v = new abc();
v.test()