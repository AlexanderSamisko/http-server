class Handler {
  constructor() {
    this.tickets = [];
  }

  registerTicket(value) {
    const ticket = {
      id: this.tickets.length,
      name: value.name,
      status: value.status,
      created: value.created,
      description: value.description,
    };

    this.tickets.push(ticket);
  }

  changeTicketStatus(value) {
    const { id } = value;
    const { status } = value;

    for (let i = 0; i < this.tickets.length; i += 1) {
      if (this.tickets[i].id === id) {
        this.tickets[i].status = status;
      }
    }
  }

  findTicket(value) {
    const { id } = value;
    for (let i = 0; i < this.tickets.length; i += 1) {
      if (this.tickets[i].id === id) {
        return i;
      }
    }
  }

  removeTicket(value) {
    const { id } = value;
    for (let i = 0; i < this.tickets.length; i += 1) {
      if (this.tickets[i].id === id) {
        this.tickets.splice(i, 1);
      }
    }
  }

  editTicket(value) {
    const { id } = value;
    const { name } = value;
    const { description } = value;
    for (let i = 0; i < this.tickets.length; i += 1) {
      if (this.tickets[i].id === id) {
        this.tickets[i].name = name;
        this.tickets[i].description = description;
      }
    }
  }
}

module.exports = {
  Handler,
};
