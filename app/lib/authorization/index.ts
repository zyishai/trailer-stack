import { read } from "./actions/read";
import { update } from "./actions/update";
import { create } from "./actions/create";
import { Entity } from "./types";
import { remove } from "./actions/remove";

export const can = (subject: Entity) => {
  return {
    read: read(subject),
    update: update(subject),
    change: update(subject),
    create: create(subject),
    remove: remove(subject),
    delete: remove(subject),
  };
};
