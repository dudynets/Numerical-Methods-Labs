from dataclasses import asdict, dataclass
import psutil


@dataclass
class ServerLoadResponse:
    cpu_load: float
    memory_load: float
    available_memory: int
    total_memory: int
    used_memory: int

    def to_dict(self):
        return asdict(self)


def get_server_load() -> ServerLoadResponse:
    cpu_load = psutil.cpu_percent()
    memory_load = psutil.virtual_memory().percent
    available_memory = psutil.virtual_memory().available
    total_memory = psutil.virtual_memory().total
    used_memory = psutil.virtual_memory().used
    return ServerLoadResponse(
        cpu_load=cpu_load,
        memory_load=memory_load,
        available_memory=available_memory,
        total_memory=total_memory,
        used_memory=used_memory,
    )
