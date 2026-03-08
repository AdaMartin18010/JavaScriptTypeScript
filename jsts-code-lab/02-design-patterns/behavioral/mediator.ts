/**
 * @file 中介者模式 (Mediator Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty medium
 * @tags mediator, behavioral, component-communication
 * 
 * @description
 * 用一个中介对象来封装一系列的对象交互
 */

// ============================================================================
// 1. 中介者接口
// ============================================================================

interface ChatMediator {
  sendMessage(message: string, sender: User): void;
  addUser(user: User): void;
}

// ============================================================================
// 2. 具体中介者
// ============================================================================

class ChatRoom implements ChatMediator {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    user.setMediator(this);
  }

  sendMessage(message: string, sender: User): void {
    for (const user of this.users) {
      // 不发送给发送者自己
      if (user !== sender) {
        user.receive(message, sender.getName());
      }
    }
  }
}

// ============================================================================
// 3. 同事类
// ============================================================================

abstract class User {
  protected mediator?: ChatMediator;

  constructor(protected name: string) {}

  setMediator(mediator: ChatMediator): void {
    this.mediator = mediator;
  }

  getName(): string {
    return this.name;
  }

  abstract send(message: string): void;
  abstract receive(message: string, from: string): void;
}

class ConcreteUser extends User {
  send(message: string): void {
    console.log(`${this.name} sends: ${message}`);
    this.mediator?.sendMessage(message, this);
  }

  receive(message: string, from: string): void {
    console.log(`${this.name} receives from ${from}: ${message}`);
  }
}

// ============================================================================
// 4. 表单组件示例
// ============================================================================

interface FormMediator {
  notify(sender: Component, event: string): void;
}

abstract class Component {
  protected mediator?: FormMediator;

  setMediator(mediator: FormMediator): void {
    this.mediator = mediator;
  }

  protected notify(event: string): void {
    this.mediator?.notify(this, event);
  }
}

class TextField extends Component {
  private value = '';

  setValue(value: string): void {
    this.value = value;
    this.notify('textChanged');
  }

  getValue(): string {
    return this.value;
  }

  clear(): void {
    this.value = '';
  }
}

class Checkbox extends Component {
  private checked = false;

  check(): void {
    this.checked = !this.checked;
    this.notify('checkboxToggled');
  }

  isChecked(): boolean {
    return this.checked;
  }
}

class Button extends Component {
  private enabled = false;

  click(): void {
    if (this.enabled) {
      this.notify('buttonClicked');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

class RegistrationForm implements FormMediator {
  private nameField = new TextField();
  private emailField = new TextField();
  private agreeCheckbox = new Checkbox();
  private submitButton = new Button();

  constructor() {
    this.nameField.setMediator(this);
    this.emailField.setMediator(this);
    this.agreeCheckbox.setMediator(this);
    this.submitButton.setMediator(this);
  }

  notify(sender: Component, event: string): void {
    if (event === 'textChanged' || event === 'checkboxToggled') {
      this.validateForm();
    } else if (event === 'buttonClicked') {
      this.submitForm();
    }
  }

  private validateForm(): void {
    const isValid =
      this.nameField.getValue().length > 0 &&
      this.emailField.getValue().includes('@') &&
      this.agreeCheckbox.isChecked();

    this.submitButton.setEnabled(isValid);
  }

  private submitForm(): void {
    console.log('Form submitted:', {
      name: this.nameField.getValue(),
      email: this.emailField.getValue()
    });
  }

  getNameField(): TextField {
    return this.nameField;
  }

  getEmailField(): TextField {
    return this.emailField;
  }

  getAgreeCheckbox(): Checkbox {
    return this.agreeCheckbox;
  }

  getSubmitButton(): Button {
    return this.submitButton;
  }
}

// ============================================================================
// 5. 事件总线 (简化版中介者)
// ============================================================================

type EventCallback = (data: unknown) => void;

class EventBus {
  private listeners = new Map<string, EventCallback[]>();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  publish(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(data);
      }
    }
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  ChatRoom,
  ConcreteUser,
  RegistrationForm,
  TextField,
  Checkbox,
  Button,
  EventBus
};

export type { ChatMediator, User, FormMediator, Component, EventCallback };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Mediator Pattern Demo ===");

  // 聊天室演示
  console.log("\nChat Room:");
  const chatRoom = new ChatRoom();

  const user1 = new ConcreteUser("Alice");
  const user2 = new ConcreteUser("Bob");
  const user3 = new ConcreteUser("Carol");

  chatRoom.addUser(user1);
  chatRoom.addUser(user2);
  chatRoom.addUser(user3);

  user1.send("Hello everyone!");
  user2.send("Hi Alice!");

  // 表单演示
  console.log("\nRegistration Form:");
  const form = new RegistrationForm();

  console.log("Trying to submit empty form...");
  form.getSubmitButton().click(); // 不应该提交

  console.log("\nFilling form...");
  form.getNameField().setValue("John Doe");
  form.getEmailField().setValue("john@example.com");
  form.getAgreeCheckbox().check();

  console.log("Submit button enabled, clicking...");
  form.getSubmitButton().click();

  // 事件总线演示
  console.log("\nEvent Bus:");
  const eventBus = new EventBus();

  const unsubscribe1 = eventBus.subscribe("user:login", (data) => {
    console.log("User logged in:", data);
  });

  const unsubscribe2 = eventBus.subscribe("user:login", (data) => {
    console.log("Another handler for login:", data);
  });

  eventBus.publish("user:login", { userId: "123", name: "Alice" });

  unsubscribe1();
  console.log("After unsubscribing first handler:");
  eventBus.publish("user:login", { userId: "456", name: "Bob" });

  console.log("=== End of Demo ===\n");
}
