$ErrorActionPreference = 'Stop'

function Stop-PortProcess {
    param([int]$port)
    Write-Host "Stopping processes listening on port $port..."

    $pids = @()

    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) { $pids = $conns.OwningProcess | Select-Object -Unique }
    } else {
        $lines = netstat -ano | Select-String "LISTENING" | Select-String ":$port\s"
        foreach ($line in $lines) {
            $cols = ($line -split '\s+') | Where-Object { $_ -ne '' }
            $candidatePid = $cols[-1]
            if ($candidatePid -match '^\d+$') { $pids += [int]$candidatePid }
        }
        $pids = $pids | Select-Object -Unique
    }

    # Remove system Idle PID (0) to avoid Access Denied errors when attempting to stop
    $pids = $pids | Where-Object { $_ -ne 0 } | Select-Object -Unique

    if ($pids -and $pids.Count -gt 0) {
        foreach ($procId in $pids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Host ("Stopped process {0} listening on port {1}" -f $procId, $port)
            } catch {
                Write-Warning ("Failed to stop process {0}: {1}" -f $procId, $_)
            }
        }
    } else {
        Write-Host "No process found on port $port"
    }
}

# Common dev ports (backend + Vite)
Stop-PortProcess -port 8000
Stop-PortProcess -port 3000
Stop-PortProcess -port 5173

# Show remaining listeners for the common dev ports
$ports = @(8000,3000,5173)
foreach ($p in $ports) {
    Write-Host ("Listeners on port {0}:" -f $p)
    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                Write-Host (" - PID {0} (Local:{1}:{2} Remote:{3}:{4}) State:{5}" -f $c.OwningProcess, $c.LocalAddress, $c.LocalPort, $c.RemoteAddress, $c.RemotePort, $c.State)
            }
        } else {
            Write-Host " - none"
        }
    } else {
        $lines = netstat -ano | Select-String "LISTENING" | Select-String ":$p\s"
        if ($lines) {
            foreach ($l in $lines) {
                $text = if ($l -is [string]) { $l } else { $l.Line }
                Write-Host (" - " + $text.Trim())
            }
        } else {
            Write-Host " - none"
        }
    }
}

Write-Host 'Stop completed.' -ForegroundColor Green
